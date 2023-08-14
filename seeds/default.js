module.exports = async function seed(config, db) {

  try {

    // TODO: minstens 1 default user, met een fixed code id en admin rechten
    // console.log(config && config.auth && config.auth.fixedAuthTokens);
    console.log('  creating initial user - add this user to config fixed tokens');
    try {
      await db.User.create({
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
