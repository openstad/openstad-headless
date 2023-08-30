export default async function doFetch(url = '', options = {}) {

  let self = this;
  
  // console.log('DO FETCH', url);

  options.headers = options.headers || {};
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

  if (self.currentUserJWT) {
    options.headers['X-Authorization'] = 'Bearer ' + self.currentUserJWT;
  }

  let response;
  response = await fetch(this.apiUrl + url, options)
  
  if (!response.ok) {
    let body = await response.json();
    throw new Error( body.error || body.message || response.statusText );
  }

  let json = await response.json();
  return json || {};

}
