const config = require('config');

module.exports = {
  init: async function (app) {

    let auth = config.auth;
    let adapters = Object.keys(auth.adapter);

    for (let adapter of adapters) {
      app.use(require(`./${adapter}/middleware.js`));
      app.use(require(`./${adapter}/route.js`));
    }

  }, 
}
