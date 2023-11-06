export default async function doFetch(url = '', options = {}) {

  let self = this;
  
  // console.log('DO FETCH', url);

  options.headers = options.headers || {};
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

  if (self.currentUserJWT) {
    options.headers['Authorization'] = 'Bearer ' + self.currentUserJWT;
  }

  console.log(1);
  let response;
  response = await fetch(this.apiUrl + url, options)
  
  if (!response.ok) {
    let body = await response.json();
    let error = new Error( body.error || body.message || response.statusText );
	  let event = new window.CustomEvent('osc-error', { detail: error });
	  document.dispatchEvent(event);
    throw error;
  }

  let json = await response.json();
  return json || {};

}
