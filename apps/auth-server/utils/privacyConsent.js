const sanitize = require('./sanitize');

const defaultLabel =
  'Ik ga akkoord met de verwerking van mijn persoonsgegevens conform de {link}';

function policyUrl(client) {
  const config = client.config || {};
  let parsed;
  try {
    parsed = new URL(
      client.clientDisclaimerUrl || config.clientDisclaimerUrl || ''
    );
  } catch {
    return '';
  }
  return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    ? parsed.href
    : '';
}

function consentField(client) {
  const url = policyUrl(client);
  if (!url) return null;

  const config = client.config || {};
  const linkTextRaw = sanitize.plainText(
    client.clientDisclaimerText ||
      config.clientDisclaimerText ||
      'privacyverklaring'
  );
  const label = sanitize.plainText(
    config.requiredFields?.requiredUserFieldsLabels?.privacyConsent ||
      defaultLabel
  );
  const [labelPrefix, labelSuffix = ''] = label.split('{link}');

  return {
    url,
    linkText: linkTextRaw.charAt(0).toLowerCase() + linkTextRaw.slice(1),
    hasLink: label.includes('{link}'),
    labelPrefix,
    labelSuffix,
  };
}

async function recordConsent(user, client) {
  const clientId = String(client.id);
  const currentValue = user.privacyConsentAt || {};
  if (currentValue.hasOwnProperty(clientId)) return;

  await user.update({
    privacyConsentAt: {
      ...currentValue,
      [clientId]: new Date().toISOString(),
    },
  });
}

module.exports = {
  policyUrl,
  consentField,
  recordConsent,
};
