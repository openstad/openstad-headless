const rp = require('request-promise');
const apiUrl = process.env.API_URL || 'http://localhost:8111';

const fetchAll = async () => {
  //
  const siteOptions = {
    uri: `${apiUrl}/api/site`, //,
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'X-Authorization': process.env.SITE_API_KEY
    },
    json: true // Automatically parses the JSON string in the response
  };

  return await rp(siteOptions);
};

module.exports = {
  fetchAll
};
