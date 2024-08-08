'use strict';

const memoryStorage                        = require('./memoryStorage');
const passport                             = require('passport');
const { Strategy: LocalStrategy }          = require('passport-local');
const { BasicStrategy }                    = require('passport-http');
const { Strategy: ClientPasswordStrategy } = require('passport-oauth2-client-password');
const { Strategy: BearerStrategy }         = require('passport-http-bearer');
const { Strategy: AuthTokenStrategy }      = require('passport-auth-token');
const db                                   = require('./db');
const validate                             = require('./validate');
const TokenStrategy                        = require('./token-strategy');

const tokenUrl = require('./services/tokenUrl');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  {usernameField: 'email'},
  (email, password, done) => {
    db.User
      .findOne({ where: {email: email} })
      .then((user) => { return validate.user(user, password) })
      .then(user => done(null, user))
      .catch(error => done(null, false, { message: 'Onjuiste inlog.' }));
  }));

/**
 * UrlStrategy
 *
 * This strategy is used to authenticate users based upon a URL link
 * For instance, user gives email, email contains url,
 * user clicks url and is automatically logged in
 */
passport.use('url', new TokenStrategy({
  failRedirect : "/auth/url/login",
  varName : "token",
  session: true
}, function (token, done) { // put your check logic here

  const minutes = 10;
  const msForAMinute = 60000;
  const date = new Date();
  const timeAgo = new Date(date.setTime(date.getTime() - (minutes * msForAMinute)));
  db.LoginToken
    .findOne({
      where: {
        token: token,
        valid: true,
        createdAt: {
          [db.Sequelize.Op.gte]: timeAgo
        }
      },
      order: [['createdAt', 'DESC']],
    })
    .then(async (token) => {

      if (token) {
        db.User
          .findOne({ where: {id: token.userId} })
          .then(user => { return done(null, user) } )
          .catch((err) => { return done(err); });
      } else {
        done("Token not found");
      }
    });
}));

passport.use('uniqueCode', new TokenStrategy({
  //   failRedirect : "/auth/code/login",
  varName : "unique_code"
}, function (code, done, client) { // put your check logic here

  db.UniqueCode
    .findOne({
      where: {
        code: code,
        clientId: client.id
      }
    })
    .then((uniqueCode) => {
      if (uniqueCode) {
        const isUsed = uniqueCode.isUsed;
        const userId = uniqueCode.userId;

        if (isUsed) {
          done("Token has been used");
        } else if (userId) {
          /**
           * In case of existing user fetch the user
           */
          db.User
            .findOne({ where: {id: userId} })
            .then(user => done(null, user))
            .catch((err) => { done(err); });
        } else {
          let user;
          /**
           * Create an "empty" user
           * Initial token registration asks for no information
           * Client can ask for more information after registration
           * Not connected to existing users because of privacy reasons
           */
          
          db.User
            .create({})
            .then((newUser) => {
              user = newUser;
              // set userId in uniqueCode to user
              return uniqueCode.update({ userId: newUser.id });
            })
            .then(response => done(null, user))
            .catch((err) => { done(err); });
        }
      } else {
        done("Token not found");
      }
    });
}));

passport.use('phonenumber', new TokenStrategy({
  failRedirect : "/auth/phonenumber/login",
  varName : "token",
}, function (token, done) { // put your check logic here

  const minutes = 60;
  const msForAMinute = 60000;
  const date = new Date();
  const timeAgo = new Date(date.setTime(date.getTime() - (minutes * msForAMinute)));
  return db.LoginToken
    .findOne({
      where: {
        token: token,
        valid: true,
        createdAt: {
          [db.Sequelize.Op.gte]: timeAgo
        }
      },
      order: [['createdAt', 'DESC']],
    })
    .then((token) => {
      if (token) {
        db.User
          .findOne({ where: {id: token.userId} })
          .then((user) => {
            return user.update({ phoneNumberConfirmed: true });
          })
          .then(user => { return done(null, user) } )
          .catch((err) => { return done(err); });
      } else {
        done("Token not found");
      }
    });
}));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */

passport.use(new BasicStrategy((clientId, clientSecret, done) => {
  db.Client
    .findOne({ where: { clientId } })
    .then(client => validate.client(client, clientSecret))
    .then(client => done(null, client))
    .catch(() => done(null, false));
}));

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
  db.Client
    .findOne({ where: { clientId } })
    .then(client => validate.client(client, clientSecret))
    .then(client => done(null, client))
    .catch(() => done(null, false));
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 *
 * To keep this example simple, restricted scopes are not implemented, and this is just for
 * illustrative purposes
 */
passport.use(new BearerStrategy((accessToken, done) => {
  memoryStorage.accessTokens.find(accessToken)
    .then(token => validate.token(token, accessToken))
    .then((token) => {
      return done(null, token, { scope: '*' });
    })
    .catch((err) => {
      console.log('Errr in authjs token', err)
      done(null, false)
    });
}));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.User
    .findOne({ where: { id }})
    .then(user => {
      if (!user) throw new Error('Error in deserializeUser for id='+id);
      done(null, user)
    })
    .catch(err => done(err));
});
