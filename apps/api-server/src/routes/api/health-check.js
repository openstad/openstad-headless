const express = require('express');
const https = require('https');
const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  let hostname = process.env.HOSTNAME;
  const additionalDomains = process.env.ADDITIONAL_UPTIME_DOMAINS ? process.env.ADDITIONAL_UPTIME_DOMAINS.split(',') : [];

  if (!hostname) {
    return res.status(500).json({
      status: 'error',
      message: 'HOSTNAME environment variable is not set'
    });
  }

  try {
    hostname = new URL(`https://${hostname.replace(/^www\./, '')}`).hostname;
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Invalid HOSTNAME environment variable'
    });
  }

  const domains = [
    `admin.${hostname}`,
    `auth.${hostname}/health`,
    `cms.${hostname}/health`,
    `img.${hostname}/health`,
    ...additionalDomains
  ].filter(Boolean);

  const checkDomain = (domain) => {
    return new Promise((resolve) => {
      const request = https.get(`https://${domain}`, { timeout: 5000 }, (response) => {
        resolve({ domain, status: response.statusCode, message: 'OK' });
      });

      request.on('error', (error) => {
        resolve({
          domain,
          status: 'Error',
          message: `Error checking ${domain}: ${error.message}`
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          domain,
          status: 'Error',
          message: `Timeout checking ${domain}`
        });
      });
    });
  };

  const results = await Promise.all(domains.map(checkDomain));

  const errorStatusCodes = [404, 500, 502, 503, 504];
  const downDomains = results.filter(result =>
    result.status === 'Error' || errorStatusCodes.includes(result.status)
  );

  const overallStatus = downDomains.length > 0 ? 'error' : 'ok';
  const overallMessage = downDomains.length > 0
    ? `The following domains are down: ${downDomains.map(d => d.domain.replace('/health', '')).join(', ')}`
    : 'OK';

  const statusCode = downDomains.length > 0 ? 500 : 200;

  res.status(statusCode).json({
    status: overallStatus,
    message: overallMessage
  });
});

module.exports = router;