const fs = require('fs').promises;
const crypto = require('crypto');

const randomCode = () => crypto.randomBytes(16).toString('hex');

const removeProtocol = (url) => {
  return url
    ? url.replace('http://', '').replace('https://', '').replace(/\/$/, '')
    : '';
};

module.exports = async function seed(db) {
  let allowedDomains =
    process.env.NODE_ENV === 'development' ? ['localhost'] : [];
  let apiDomain =
    process.env.API_DOMAIN || removeProtocol(process.env.API_URL) || '';
  allowedDomains.push(apiDomain);
  let apiDomainWithoutPortnumber = apiDomain.replace(/:\d+/, '');
  if (apiDomain != apiDomainWithoutPortnumber)
    allowedDomains.push(apiDomainWithoutPortnumber);

  process.env.AUTH_FIRST_LOGIN_CODE =
    process.env.AUTH_FIRST_LOGIN_CODE || rack();
  let uniqueCode = process.env.AUTH_FIRST_LOGIN_CODE;

  const anonymousSecret =
    process.env.DEV_ANONYMOUS_CLIENT_SECRET || randomCode();
  const codes = {
    admin: randomCode(),
    moderator: randomCode(),
    editor: randomCode(),
    member: randomCode(),
  };

  console.log('  creating development data');

  try {
    console.log('    - generic uniquecode client');
    console.log('      clientId:', 'uniquecode');
    console.log('      clientSecret:', 'uniquecode123');
    await db.Client.create({
      id: 3,
      redirectUrl: '', // deprecated
      name: 'Default site',
      description: 'Client for managing default site',
      clientId: 'uniquecode',
      clientSecret: 'uniquecode123',
      authTypes: JSON.stringify(['UniqueCode']),
      requiredUserFields: JSON.stringify(['name']),
      allowedDomains: JSON.stringify(allowedDomains),
      config: JSON.stringify({}),
    });

    console.log('    - generic anonymous client');
    console.log('      clientId:', 'anonymous');
    console.log('      clientSecret:', anonymousSecret);
    await db.Client.create({
      id: 4,
      redirectUrl: '', // deprecated
      name: 'Default site',
      description: 'Client for managing default site',
      clientId: 'anonymous',
      clientSecret: anonymousSecret,
      authTypes: JSON.stringify(['Anonymous']),
      requiredUserFields: JSON.stringify(['postcode']),
      allowedDomains: JSON.stringify(allowedDomains),
      config: JSON.stringify({}),
    });

    console.log('      uniquecodes for the initial admin user');
    await db.UserRole.create({
      roleId: 1,
      clientId: 3,
      userId: 1,
    });
    await db.UniqueCode.create({
      code: uniqueCode,
      userId: 1,
      clientId: 3,
    });
    await db.UserRole.create({
      roleId: 1,
      clientId: 4,
      userId: 1,
    });
    await db.UniqueCode.create({
      code: uniqueCode,
      userId: 1,
      clientId: 4,
    });

    console.log('    - generic admin user');
    console.log('      uniquecode:', codes.admin);
    await db.User.create({
      id: 2,
      name: 'Development admin',
    });
    await db.UserRole.create({
      roleId: 1,
      clientId: 3,
      userId: 2,
    });
    await db.UniqueCode.create({
      code: codes.admin,
      userId: 2,
      clientId: 3,
    });

    console.log('    - generic moderator user');
    console.log('      uniquecode:', codes.moderator);
    await db.User.create({
      id: 3,
      role: 'moderator',
      name: 'Development moderator',
    });
    await db.UserRole.create({
      roleId: 4,
      clientId: 3,
      userId: 3,
    });
    await db.UniqueCode.create({
      code: codes.moderator,
      userId: 3,
      clientId: 3,
    });

    console.log('    - generic editor user');
    console.log('      uniquecode:', codes.editor);
    await db.User.create({
      id: 4,
      role: 'editor',
      name: 'Development editor',
    });
    await db.UserRole.create({
      roleId: 5,
      clientId: 3,
      userId: 4,
    });
    await db.UniqueCode.create({
      code: codes.editor,
      userId: 4,
      clientId: 3,
    });

    console.log('    - generic member user');
    console.log('      uniquecode:', codes.member);
    await db.User.create({
      id: 5,
      role: 'member',
      name: 'Development member',
    });
    await db.UserRole.create({
      roleId: 2,
      clientId: 3,
      userId: 5,
    });
    await db.UniqueCode.create({
      code: codes.member,
      userId: 5,
      clientId: 3,
    });
  } catch (err) {
    console.log(err);
  }
};
