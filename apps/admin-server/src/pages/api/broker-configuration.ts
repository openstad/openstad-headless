export default async function getBrokerConfigurationFromUrl(req, res) {

  // Extract the URL from the request body
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Fetch the broker configuration
  const fetchResponse = await fetch(url.toString());
  const data = await fetchResponse.json();

  // Sanitize data
  if (!data) {
    return res.status(400).json({ error: 'Invalid broker configuration' });
  }

  const sanitizedData = {
    pkceEnabled: "false"
  }

  if (data?.id_token_signing_alg_values_supported && data?.id_token_signing_alg_values_supported.length > 0) {
    sanitizedData.pkceEnabled = "true";
  }

  const issuer = data?.issuer ?? '';

  if (!issuer) {
    return res.status(400).json({ error: 'Invalid issuer in broker configuration' });
  }

  // Check if the issuer matches the URL
  const issuerUrl = new URL(issuer);
  const urlObj = new URL(url);
  if (issuerUrl.hostname !== urlObj.hostname) {
    return res.status(400).json({ error: 'Issuer does not match the URL' });
  }

  sanitizedData.serverUrl = 'https://' + issuerUrl.hostname;

  // Make the other URLs relative
  const mapping = {
    "authorization_endpoint": "serverLoginPath",
    "end_session_endpoint": "serverLogoutPath",
    "userinfo_endpoint": "serverUserInfoPath",
    "token_endpoint": "serverExchangeCodePath",
  }

  for (const [key, value] of Object.entries(mapping)) {
    if (data[key]) {
      const url = new URL(data[key]);
      if (url.hostname === issuerUrl.hostname) {
        // @ts-ignore
        sanitizedData[value] = url.pathname;
      } else {
        return res.status(400).json({ error: `${key} is invalid and does not contain issuer URL` });
      }
    }
  }

  sanitizedData.serverLoginPath = sanitizedData.serverLoginPath + `?client_id=[[clientId]]&redirect_uri=[[redirectUri]]&response_type=code&scope=openid%20irma-demo.gemeente.personalData.fullname%20irma-demo.sidn-pbdf.email.email%20irma-demo.sidn-pbdf.uniqueid.uniqueid&code_challenge=[[codeChallenge]]&code_challenge_method=S256&response_mode=query`;

  const serverExchangeContentType = data?.token_endpoint_auth_methods_supported?.includes('client_secret_post') ? 'application/x-www-form-urlencoded' : 'application/json';
  sanitizedData.serverExchangeContentType = serverExchangeContentType;

  res.status(200).json(sanitizedData);

}
