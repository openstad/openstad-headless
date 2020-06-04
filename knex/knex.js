const environment = process.env.NODE_ENV === 'test' ? 'test' : process.env.ENVIRONMENT || 'development';
const config = require('../knexfile.js')[environment];
module.exports = require('knex')(config);
