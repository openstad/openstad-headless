const mongodbConnect = require('apostrophe/lib/mongodb-connect');
const escapeHost = require('apostrophe/lib/escape-host');

module.exports = {
  methods(self) {
    // I cannot find how to send options from app.js run()
    // sending self.apos is possible, so this routine is a copy of the original routine in apostrophe/db/index.js with all self.options replaced by self.apos.options.mongo
    return {
      async connectToMongo() {
        if (self.apos.options.mongo.client) {
          // Reuse a single client connection http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#db
          self.apos.dbClient = self.apos.options.mongo.client;
          self.apos.db = self.apos.options.mongo.client.db(self.apos.options.mongo.name || self.apos.shortName);
          self.connectionReused = true;
          return;
        }
        let Logger;
        if (process.env.APOS_MONGODB_LOG_LEVEL) {
          Logger = require('mongodb').Logger;
          // Set debug level
          Logger.setLevel(process.env.APOS_MONGODB_LOG_LEVEL);
        }
        let uri = 'mongodb://';
        if (process.env.APOS_MONGODB_URI) {
          uri = process.env.APOS_MONGODB_URI;
        } else if (self.apos.options.mongo.uri) {
          uri = self.apos.options.mongo.uri;
        } else {
          if (self.apos.options.mongo.user) {
            uri += self.apos.options.mongo.user + ':' + self.apos.options.mongo.password + '@';
          }
          if (!self.apos.options.mongo.host) {
            self.apos.options.mongo.host = 'localhost';
          }
          if (!self.apos.options.mongo.port) {
            self.apos.options.mongo.port = 27017;
          }
          if (!self.apos.options.mongo.name) {
            self.apos.options.mongo.name = self.apos.shortName;
          }
          uri += escapeHost(self.apos.options.mongo.host) + ':' + self.apos.options.mongo.port + '/' + self.apos.options.mongo.name;
        }

        self.apos.dbClient = await mongodbConnect(uri, self.apos.options.mongo.connect);
        self.uri = uri;
        const parsed = new URL(uri);
        self.apos.db = self.apos.dbClient.db(parsed.pathname.substring(1));

      }
    }
  }
};
