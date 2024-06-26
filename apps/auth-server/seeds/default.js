const hat = require("hat");

const removeProtocol = (url) => {
  return url
    ? url.replace("http://", "").replace("https://", "").replace(/\/$/, "")
    : "";
};

module.exports = async function seed(db) {
  let rack = hat.rack();
  let clientId = process.env.AUTH_FIRST_CLIENT_ID
    ? process.env.AUTH_FIRST_CLIENT_ID
    : rack();
  let clientSecret = process.env.AUTH_FIRST_CLIENT_SECRET
    ? process.env.AUTH_FIRST_CLIENT_SECRET
    : rack();
  let adminClientId = process.env.AUTH_ADMIN_CLIENT_ID
    ? process.env.AUTH_ADMIN_CLIENT_ID
    : rack();
  let adminClientSecret = process.env.AUTH_ADMIN_CLIENT_SECRET
    ? process.env.AUTH_ADMIN_CLIENT_SECRET
    : rack();
  let headlessClientId = process.env.AUTH_HEADLESS_CLIENT_ID
    ? process.env.AUTH_HEADLESS_CLIENT_ID
    : rack();
  let headlessClientSecret = process.env.AUTH_HEADLESS_CLIENT_SECRET
    ? process.env.AUTH_HEADLESS_CLIENT_SECRET
    : rack();

  let adminUrl = process.env.ADMIN_URL
    ? process.env.ADMIN_URL
    : process.env.APP_URL;
  let headlessUrl = process.env.HEADLESS_URL
    ? process.env.HEADLESS_URL
    : "http://localhost:3000";

  let allowedDomains = process.env.NODE_ENV === "development" ? ["localhost"] : [];
  let apiDomain = process.env.API_DOMAIN || removeProtocol(process.env.API_URL) || '';
  allowedDomains.push(apiDomain);
  let apiDomainWithoutPortnumber = apiDomain.replace(/:\d+/, '');
  if (apiDomain != apiDomainWithoutPortnumber) allowedDomains.push(apiDomainWithoutPortnumber);
  let adminDomain = process.env.ADMIN_DOMAIN || removeProtocol(process.env.ADMIN_URL) || '';
  allowedDomains.push(adminDomain);
  let adminDomainWithoutPortnumber = adminDomain.replace(/:\d+/, '');
  if (adminDomain != adminDomainWithoutPortnumber) allowedDomains.push(adminDomainWithoutPortnumber);

  process.env.AUTH_FIRST_LOGIN_CODE = process.env.AUTH_FIRST_LOGIN_CODE || rack() 
  let uniqueCode = process.env.AUTH_FIRST_LOGIN_CODE;

  console.log('  creating initial clients');
  console.log('    - admin site');
  console.log('      clientId:', adminClientId);
  console.log('      clientSecret:', adminClientSecret);

  try {
    await db.Client.create({
      id: 1,
      redirectUrl: "", // deprecated
      name: "Admin panel",
      description: "Client for managing the admin panel",
      clientId: adminClientId,
      clientSecret: adminClientSecret,
      authTypes: JSON.stringify(["UniqueCode"]),
      requiredUserFields: JSON.stringify(["name"]),
      allowedDomains: JSON.stringify(allowedDomains),
      config: JSON.stringify({}),
    });

    console.log("    - default site");
    console.log("      clientId:", clientId);
    console.log("      clientSecret:", clientSecret);
    await db.Client.create({
      id: 2,
      redirectUrl: "", // deprecated
      name: "Default site",
      description: "Client for managing default site",
      clientId: clientId,
      clientSecret: clientSecret,
      authTypes: JSON.stringify(["UniqueCode"]),
      requiredUserFields: JSON.stringify(["name"]),
      allowedDomains: JSON.stringify(allowedDomains),
      config: JSON.stringify({}),
    });
  } catch (err) {
    console.log(err);
  }

  console.log("  creating initial user");
  try {
    await db.User.create({
      id: 1,
    });
  } catch (err) {
    console.log(err);
  }

  console.log("  creating roles");
  try {
    await db.Role.create({
      id: 1,
      name: "admin",
    });

    await db.Role.create({
      id: 2,
      name: "member",
    });

    await db.Role.create({
      id: 3,
      name: "anonymous",
    });

    await db.Role.create({
      id: 4,
      name: "moderator",
    });

    await db.Role.create({
      id: 5,
      name: "editor",
    });
  } catch (err) {
    console.log(err);
  }

  console.log("  creating admin role for user id=1");
  try {
    await db.UserRole.create({
      roleId: 1,
      clientId: 1,
      userId: 1,
    });

    await db.UserRole.create({
      roleId: 1,
      clientId: 2,
      userId: 1,
    });

    await db.UserRole.create({
      roleId: 1,
      clientId: 3,
      userId: 1,
    });
  } catch (err) {
    console.log(err);
  }

  console.log("  creating unique code for user id=1");
  console.log("    use this for your first login:", uniqueCode);
  try {
    await db.UniqueCode.create({
      code: uniqueCode,
      userId: 1,
      clientId: 1,
    });
  } catch (err) {
    console.log(err);
  }

  try {
    await db.UniqueCode.create({
      code: uniqueCode,
      userId: 1,
      clientId: 2,
    });
  } catch (err) {
    console.log(err);
  }
};
