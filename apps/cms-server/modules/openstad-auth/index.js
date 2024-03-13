/**
 * The openstad-auth Module contains routes and logic for authenticating users with the openstad API
 * and if valid fetches the user data
 */

const fetch = require('node-fetch');
const Url = require('url');
const generateRandomPassword = () => {
  return require('crypto').randomBytes(64).toString('hex');
};

function removeURLParameter(url, parameter) {
  // prefer to use l.search if you have a location/link object
  const urlparts = url.split('?');
  if (urlparts.length >= 2) {

    const prefix = encodeURIComponent(parameter) + '=';
    const pars = urlparts[1].split(/[&;]/g);

    // reverse iteration as may be destructive
    for (let i = pars.length; i-- > 0;) {
      // idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
  }
  return url;
};

module.exports = {
  middleware(self) {
    return {
      async authenticate (req, res, next) {
        if (!req.session) {
          next();
        }

        const thisHost = req.headers['x-forwarded-host'] || req.get('host');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const fullUrl = protocol + '://' + thisHost + req.originalUrl;
        const parsedUrl = Url.parse(fullUrl, true);

        // add apostrophes permissions function to the data object so we can check it in the templates
        req.data.userCan = function (permission) {
          return self.apos.permissions.can(req, permission);
        };

        if (req.query.openstadlogintoken) {
          const thisHost = req.headers['x-forwarded-host'] || req.get('host');
          const protocol = req.headers['x-forwarded-proto'] || req.protocol;
          const fullUrl = protocol + '://' + thisHost + req.originalUrl;
          const parsedUrl = Url.parse(fullUrl, true);
          const fullUrlPath = parsedUrl.path;

          // remove the JWT Parameter otherwise keeps redirecting
          let returnTo = req.session && req.session.returnTo ? req.session.returnTo : removeURLParameter(fullUrlPath, 'openstadlogintoken');

          // make sure references to external urls fail, only take the path
          returnTo = Url.parse(returnTo, true);
          returnTo = returnTo.path;
          req.session.jwt = req.query.openstadlogintoken;
          req.session.returnTo = null;

          req.session.save(() => {
            res.redirect(returnTo);
          });

        } else {

          const jwt = req.session.jwt;
          const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;

          if (!jwt) {
            next();
          } else {

            const projectId = req.project.id;
            const url = projectId ? `${apiUrl}/auth/project/${projectId}/me` : `${apiUrl}/auth/me`;

            const setUserData = function (req, next) {

              const requiredRoles = [ 'member', 'moderator', 'admin', 'editor' ];
              const user = req.session.openstadUser;
              req.data.loggedIn = user && user.role && requiredRoles.includes(user.role);
              req.data.openstadUser = user;
              req.data.isAdmin = user.role === 'admin'; // user;
              req.data.isEditor = user.role === 'editor'; // user;
              req.data.isModerator = user.role === 'moderator'; // user;
              req.data.jwt = jwt;
              req.data.globalOpenStadUser = { id: user.id, role: user.role, jwt };

              if (req.data.isAdmin || req.data.isEditor || req.data.isModerator) {
                req.data.hasModeratorRights = true;
              }

              req.session.save(() => {
                next();
              });
            };

            const FIVE_MINUTES = 5 * 60 * 1000;
            const date = new Date();
            const dateToCheck = req.session.lastJWTCheck ? new Date(req.session.lastJWTCheck) : new Date();

            // IN V2 apostropheCMS does a lot calls on page load
            // if user is a CMS user and last apicheck was within 5 seconds ago don't repeat
            if (req.user && req.session.openstadUser && ((date - dateToCheck) < FIVE_MINUTES)) {
              setUserData(req, next);
            } else {

              try {
                let response = await fetch(url, {
                  headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwt}`,
                    'Cache-Control': 'no-cache'
                  },
                })
                if (!response.ok) {
                  console.log(response);
                  throw new Error('Fetch failed')
                }

                let user = await response.json();

                if (user && Object.keys(user).length > 0 && user.id) {

                  req.session.openstadUser = user;
                  req.session.lastJWTCheck = new Date().toISOString();

                  setUserData(req, next);

                } else {
                  // if not valid clear the JWT and redirect
                  req.session.destroy(() => {
                    res.redirect('/');
                  });
                }

              } catch(err) {
                console.log(err);
                req.session.destroy(() => {
                  res.redirect('/');
                });
              }

            }
          }
        }
      },
      /**
       * Authenticated users are automatically logged into the CMS
       *
       * @param {*} req
       * @param {*} res
       * @param {*} next
       * @returns
       */
      async aposAuthenticate(req, res, next) {
        // only login users into ApostropheCMS that are admin or editor
        if (!req.data.isAdmin && !req.data.isEditor) {
          return next();
        }

        const groupName = req.data.isAdmin ? 'admin' : (req.data.isEditor ? 'editor' : false);

        // openstad user is the object authenticated by the openstad system
        //
        const user = req.data.openstadUser;

        // this is a hack to allow admin to login with a unique code without email, since email is expected by apostropheCMS
        const email = user.email ? user.email : user.id + '@openstad.org';

        // if logged in to aposthrophecms, move on
        if (req.user && req.user.email === email) {
          return next();
          // logout CMS when apostropheUser is different then openstadUser
        } else if (req.user && req.user.email !== req.data.openstadUser.email) {
          console.log('Logout apos');
          //req.apos.logout();
        };

        if (self.apos && self.apos.user) {
          let aposUser;

          try {
            aposUser = await self.apos.user
              .find(req, { email: email })
              .permission(false)
              .toObject();
          } catch (e) {
            console.log('');
            return next(e);
          }

          /// Call `self.apos.tasks.getReq()` to get a `req` object with
          // unlimited admin permissions.
          const taskReq = self.apos.task.getReq();

          const username = user.id ? 'openstad_org_' + user.id : user.id;
          const firstName = user.firstName ? user.firstName : 'first_name_' + user.id;
          const lastName = user.lastName ? user.lastName : 'last_name_' + user.id;

          // define user object
          const userData = {
            username: username, // easy way to keep the username unique is using the email, wont be used anyway
            title: email,
            password: generateRandomPassword(), // generate a random password since apostrophe expects it
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: groupName,
            type: '@apostrophecms/user',
          };

          /**
           * See if user already exists
           */
          if (aposUser) {
            userData._id = aposUser._id;
          }

          // update or inster depending on if user exists
          const insertOrUpdate = aposUser ? self.apos.user.update : self.apos.user.insert;

          // In case user relogs in the data gets updated
          // one downside, if the user's admin or editor rights are revoked,
          // this will only go into effect after logging out
          try {
            await insertOrUpdate(taskReq, userData);
          } catch (e) {
            console.log('error', e);
          }

          try {
            await req.login(aposUser, () => {
              res.redirect(req.originalUrl);
            });
          } catch (e) {
            console.log('errr', e);
            return next(e);
          }
        }
      }
    };
  }
};
