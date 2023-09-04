const hat = require('hat');

const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

module.exports = async function seed(db) {

  let rack = hat.rack();
  let clientId = process.env.AUTH_FIRST_CLIENT_ID ? process.env.AUTH_FIRST_CLIENT_ID : rack();
  let clientSecret = process.env.AUTH_FIRST_CLIENT_SECRET ? process.env.AUTH_FIRST_CLIENT_SECRET : rack();
  let adminClientId = process.env.AUTH_ADMIN_CLIENT_ID ? process.env.AUTH_ADMIN_CLIENT_ID : rack();
  let adminClientSecret = process.env.AUTH_ADMIN_CLIENT_SECRET ? process.env.AUTH_ADMIN_CLIENT_SECRET : rack();

  let siteUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL :  process.env.APP_URL;
  let adminUrl = process.env.ADMIN_URL ? process.env.ADMIN_URL :  process.env.APP_URL;

  let defaultAllowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];

  let allowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];
  allowedDomains.push(removeProtocol(process.env.API_URL));

  await db.Client.create({
      id: 1,
      siteUrl: siteUrl,
      redirectUrl: '',// deprecated
      name: "Default site",
      description: 'Client for managing default site',
      clientId: clientId,
      clientSecret: clientSecret,
      authTypes: JSON.stringify(['UniqueCode']),
      requiredUserFields: JSON.stringify(['firstName', 'lastName']),
      allowedDomains: JSON.stringify(allowedDomains),
      config: JSON.stringify({}),
  });

  await db.Client.create({
    id: 2,
    siteUrl: adminUrl,
    redirectUrl: '',// deprecated
    name: "Admin panel",
    description: 'Client for managing the admin panel',
    clientId: adminClientId,
    clientSecret: adminClientSecret,
    authTypes: JSON.stringify(['UniqueCode']),
    requiredUserFields: JSON.stringify(['firstName', 'lastName']),
    allowedDomains: JSON.stringify(allowedDomains),
    config: JSON.stringify({}),
  });

  await db.User.create({
    id: 1,
  });

  await db.Role.create({
    id: 1,
    name: 'admin'
  });

  await db.Role.create({
    id: 2,
    name: 'member'
  });

  await db.Role.create({
    id: 3,
    name: 'anonymous'
  });

  await db.Role.create({
    id: 4,
    name: 'moderator'
  });

  await db.Role.create({
    id: 5,
    name: 'editor'
  });

  rack = hat.rack();
  const uniqueCode = process.env.AUTH_FIRST_CLIENT_LOGIN_CODE ? process.env.AUTH_FIRST_CLIENT_LOGIN_CODE : rack();

  await db.UniqueCode.create({
    code: uniqueCode,
    userId: 1,
    clientId: 1
  });

  await db.UniqueCode.create({
    code: uniqueCode,
    userId: 1,
    clientId: 2
  });

  await db.UserRole.create({
    roleId: 1,
    clientId: 1,
    userId: 1
  });

  await db.UserRole.create({
    roleId: 1,
    clientId: 2,
    userId: 1
  });
  

}
