const prefillAllowedDomains = function (allowedDomains) {
  try {
    if ( process.env.BASE_DOMAIN ) {
      let baseDomain = process.env.BASE_DOMAIN;
      if (baseDomain.indexOf('http') !== 0) {
        baseDomain = 'https://' + baseDomain;
      }
      const baseUrl = new URL(baseDomain);
      allowedDomains.push(baseUrl.host);
    }
    
    if (process.env.HOSTNAME) {
      let hostname = process.env.HOSTNAME;
      if (hostname.indexOf('http') !== 0) {
        hostname = 'https://' + hostname;
      }
      const url = new URL(hostname);
      allowedDomains.push(url.host);
    }
    
    if (process.env.CMS_URL) {
      const cmsUrl = new URL(process.env.CMS_URL);
      allowedDomains.push(cmsUrl.host);
    }
    
    if (process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL) {
      const authUrl = new URL(process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL);
      allowedDomains.push(authUrl.host);
    }
    
    if (process.env.ADMIN_DOMAIN) {
      allowedDomains.push(process.env.ADMIN_DOMAIN);
    }
  } catch(err) {
    console.error('Error processing allowed domains:', err);
    return [...new Set(allowedDomains)];
  }
  
  return [...new Set(allowedDomains)];
}

module.exports = prefillAllowedDomains;
