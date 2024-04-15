module.exports = async function seed(config, db) {

  try {

    console.log('  creating default project');
    let project = await db.Project.create({
      id: 1,
      name: 'Admin',
      title: 'Admin',
      config: {
        resources: {
          extraData: {
            images: {
              type: 'arrayOfStrings',
              default: [],
            }
          }
        },
        "auth": {
          "default": "openstad",
          "provider": {
            "openstad": {
              "adapter": "openstad",
              "clientId": process.env.AUTH_ADMIN_CLIENT_ID || "uniquecode",
              "clientSecret": process.env.AUTH_ADMIN_CLIENT_SECRET || "uniquecode123",
            },
          }
        },
      },
    });

    console.log('  creating initial user - add this user to config fixed tokens');
    try {
      await db.User.create({
        projectId: 1,
        role: 'admin',
        name: 'Initial super user',
      });
    } catch(err) {
      console.log(err);
    }

    // map polygons
    console.log('  creating map polygons');
    const polygons = require('./polygons');
    for (let key in polygons) {
      await db.Area.create({
        name: key,
        polygon: polygons[ key ],
      });
    }

  } catch (err) {
    console.log(err);
  }

}
