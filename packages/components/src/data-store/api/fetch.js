export default async function doFetch(url = '', options = {}) {

  let self = this;
  
  console.log('DO FETCH', url);
  try {

    if (self.currentUserJWT) {
      options.headers = options.headers || {};
      options.headers['X-Authorization'] = 'Bearer ' + self.currentUserJWT;
    }

    let response = await fetch(this.apiUrl + url, options)
    if (!response.ok) throw new Error('Fetch idea failed')
    let json = await response.json();
    return json || {};

  } catch(err) {
    console.log(err);
    throw err;
  }
}
