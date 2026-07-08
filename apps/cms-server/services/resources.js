const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;

const fetchOne = async (projectId, resourceId) => {
  try {
    let uri = `${apiUrl}/api/project/${projectId}/resource/${resourceId}`;
    let response = await fetch(uri, {
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: process.env.API_KEY,
      },
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error(
      '[resources.fetchOne] Failed to fetch resource:',
      err.message
    );
    return null;
  }
};

module.exports = {
  fetchOne,
};
