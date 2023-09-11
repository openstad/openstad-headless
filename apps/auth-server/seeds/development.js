const fs = require('fs').promises;

const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

module.exports = async function seed(db) {

  let siteUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : process.env.APP_URL;

  let allowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];
  allowedDomains.push(removeProtocol(process.env.API_URL));

  console.log('  creating development data');


  try {

    console.log('    - generic uniquecode client');
    console.log('      clientId:', 'uniquecode');
    console.log('      clientSecret:', 'uniquecode123');
    await db.Client.create({
      id: 3,
      siteUrl: siteUrl,
      redirectUrl: '', // deprecated
      name: "Default site",
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
    console.log('      clientSecret:', 'anonymous123');
    await db.Client.create({
      id: 4,
      siteUrl: siteUrl,
      redirectUrl: '', // deprecated
      name: "Default site",
      description: 'Client for managing default site',
      clientId: 'anonymous',
      clientSecret: 'anonymous123',
      authTypes: JSON.stringify(['Anonymous']),
      requiredUserFields: JSON.stringify(['name']),
      allowedDomains: JSON.stringify(allowedDomains),
      config: JSON.stringify({}),
    });

    console.log('    - generic admin user');
    console.log('      uniquecode: 123');
    await db.User.create({
      id: 2,
      name: 'Development admin',
    });
    await db.UserRole.create({
      roleId: 1,
      clientId: 3,
      userId: 2
    });
    await db.UniqueCode.create({
      code: '123',
      userId: 2,
      clientId: 3
    });

    console.log('    - generic moderator user');
    console.log('      uniquecode: 456');
    await db.User.create({
      id: 3,
      role: 'moderator',
      name: 'Development moderator',
    });
    await db.UserRole.create({
      roleId: 4,
      clientId: 3,
      userId: 3
    });
    await db.UniqueCode.create({
      code: '456',
      userId: 3,
      clientId: 3
    });

    console.log('    - generic editor user');
    console.log('      uniquecode: 457');
    await db.User.create({
      id: 4,
      role: 'editor',
      name: 'Development editor',
    });
    await db.UserRole.create({
      roleId: 5,
      clientId: 3,
      userId: 4
    });
    await db.UniqueCode.create({
      code: '457',
      userId: 4,
      clientId: 3
    });

    console.log('    - generic member user');
    console.log('      uniquecode: 789');
    await db.User.create({
      id: 5,
      role: 'member',
      name: 'Development member',
    });
    await db.UserRole.create({
      roleId: 2,
      clientId: 3,
      userId: 5
    });
    await db.UniqueCode.create({
      code: '789',
      userId: 5,
      clientId: 3
    });
    
  } catch(err) {
    console.log(err);
  }
  
}








