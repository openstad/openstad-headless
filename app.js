const app = require('./app-init');
const config = require('./config');
const db = require('./db');

/**
 * From time to time we need to clean up any expired tokens
 * in the database
 */
setInterval(() => {
  db
    .accessTokens
    .removeExpired()
    .catch(err => console.error('Error trying to remove expired tokens:', err.stack));
}, config.db.timeToCheckExpiredTokens * 1000);

// Set the ip-address of your trusted reverse proxy server such as
// haproxy or Apache mod proxy or nginx configured as proxy or others.
// The proxy server should insert the ip address of the remote client
// through request header 'X-Forwarded-For' as
// 'X-Forwarded-For: some.client.ip.address'
// Insertion of the forward header is an option on most proxy software
app.set('trust proxy', true);

// for dev allow http
app.listen(app.get('port'), function() {
  console.log('OAuth 2.0 Authorization Server started on port ' +  app.get('port'));
  console.log('Express server listening on port ' + app.get('port'));
});
