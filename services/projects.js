const fetch = require('node-fetch');
const apiUrl = process.env.API_URL || 'http://localhost:8111';

const fetchAll = async () => {
  
  try {
    let uri = `${apiUrl}/api/project?includeConfig=1`;
    let response = await fetch(uri, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Authorization': process.env.API_KEY,
      }
    })
    if (!response.ok) {
      console.log(response);
      throw new Error('Fetch failed')
    }
    return await response.json();
  } catch(err) {
    console.log(err);
  }

};

module.exports = {
  fetchAll
};
