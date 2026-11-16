const { privilegedRoles } = require('../config/roles');
const clientAuth = require('../utils/clientAuth');

const isVoteCodeOnlyIdentity = (user) =>
  !!user && !user.email && !user.phoneNumber && !user.hashedPhoneNumber;

const acceptsVoteCodes = (client) =>
  (client?.authTypes || []).includes('UniqueCode');

const loginUrlFor = (req) => {
  let url = '/login?clientId=' + req.client.clientId;
  if (req.redirectUri) {
    url = url + '&redirect_uri=' + encodeURIComponent(req.redirectUri);
  }
  return url;
};

module.exports = async function endCodeOnlySessionForOtherClients(
  req,
  res,
  next
) {
  if (process.env.MULTI_PROJECT_LOGIN !== 'true') return next();
  if (!isVoteCodeOnlyIdentity(req.user) || acceptsVoteCodes(req.client)) {
    return next();
  }

  try {
    const role = await clientAuth.resolveRoleForClient(req.user, req.client);
    if (privilegedRoles.includes(role)) return next();

    await new Promise((resolve, reject) =>
      req.session.destroy((err) => (err ? reject(err) : resolve()))
    );
    return res.redirect(loginUrlFor(req));
  } catch (err) {
    return next(err);
  }
};
