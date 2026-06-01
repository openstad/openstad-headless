const userFields = require('../../config/user').fields;
const sanitize = require('../../utils/sanitize');

exports.index = (req, res, next) => {
  let requiredUserFields = req.client.requiredUserFields;

  requiredUserFields = requiredUserFields
    .map((field) => {
      const found = userFields.find((userField) => userField.key === field);
      return found ? { ...found } : null;
    })
    .filter(Boolean);

  requiredUserFields = requiredUserFields.filter((field) => {
    // Consent field is a special case since it can contain multiple client IDs
    if (field?.key === 'emailNotificationConsent') {
      const clientId = String(req?.client?.id);

      const currentValue = req?.user?.emailNotificationConsent || {};
      const clientConsentIsSet = currentValue.hasOwnProperty(clientId);

      return !clientConsentIsSet;
    }

    // Privacy consent is stored per client ID as a timestamp
    if (field?.key === 'privacyConsent') {
      const clientId = String(req?.client?.id);
      const currentValue = req?.user?.privacyConsentAt || {};
      const clientConsentIsSet = currentValue.hasOwnProperty(clientId);

      return !clientConsentIsSet;
    }

    return !req.user[field.key];
  });

  const config = req.client.config ? req.client.config : {};
  const configRequiredFields =
    config && config.requiredFields ? config.requiredFields : {};

  const requiredUserFieldsLabels =
    (config && config.requiredFields?.requiredUserFieldsLabels) || {};

  const privacyPolicyUrl =
    req.client.clientDisclaimerUrl || config?.clientDisclaimerUrl || '';
  const privacyPolicyTextRaw = sanitize.noTags(
    req.client.clientDisclaimerText ||
      config?.clientDisclaimerText ||
      'privacyverklaring'
  );
  const privacyPolicyText =
    privacyPolicyTextRaw.charAt(0).toLowerCase() +
    privacyPolicyTextRaw.slice(1);

  // Replace field labels with labels defined in the client config (if provided)
  if (Object.keys(requiredUserFieldsLabels).length > 0) {
    requiredUserFields = requiredUserFields.map((field) => {
      const newLabel = requiredUserFieldsLabels[field.key];

      if (!!newLabel) {
        field.label = sanitize.noTags(newLabel);
      }

      return field;
    });
  }

  // Replace {link} placeholder in privacyConsent label with actual anchor tag
  requiredUserFields = requiredUserFields.map((field) => {
    if (field.key === 'privacyConsent' && field.label.includes('{link}')) {
      const anchor = privacyPolicyUrl
        ? `<a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" aria-label="${privacyPolicyText} (opent in nieuw tabblad)">${privacyPolicyText}</a>`
        : privacyPolicyText;
      field.label = sanitize.noTags(field.label).replace('{link}', anchor);
    }
    return field;
  });

  res.render('auth/required-fields', {
    client: req.client,
    clientId: req.client.clientId,
    requiredFields: requiredUserFields,
    info: configRequiredFields.info,
    description: configRequiredFields.description,
    title: configRequiredFields.title,
    buttonText: configRequiredFields.buttonText,
    redirect_uri: req.query.redirect_uri
      ? encodeURIComponent(req.query.redirect_uri)
      : '',
  });
};

exports.post = (req, res, next) => {
  const clientRequiredUserFields = req.client.requiredUserFields;
  const redirectUrl = req.query.redirect_uri
    ? encodeURIComponent(req.query.redirect_uri)
    : req.client.redirectUrl;
  if (!redirectUrl)
    return next(
      new Error(
        'No redirect_uri provided and no default redirectUrl configured for this client'
      )
    );

  let data = {};
  clientRequiredUserFields.forEach((field) => {
    if (field === 'emailNotificationConsent') {
      const clientId = String(req?.client?.id);
      const currentValue = req?.user?.emailNotificationConsent || {};
      const clientConsentIsSet = currentValue.hasOwnProperty(clientId);

      if (clientConsentIsSet) {
        data[field] = currentValue;
      } else {
        const newValue = req.body[field] === 'on' ? true : false;
        data[field] = {
          ...currentValue,
          [clientId]: newValue,
        };
      }
    } else if (field === 'privacyConsent') {
      const clientId = String(req?.client?.id);
      const currentValue = req?.user?.privacyConsentAt || {};
      const clientConsentIsSet = currentValue.hasOwnProperty(clientId);

      if (!clientConsentIsSet) {
        if (req.body[field] !== 'on') {
          req.flash('error', {
            msg: 'Je moet akkoord gaan met de privacyverklaring om verder te gaan.',
          });
          return res.redirect(
            `/auth/required-fields?redirect_uri=${redirectUrl}`
          );
        }
        data['privacyConsentAt'] = {
          ...currentValue,
          [clientId]: new Date().toISOString(),
        };
      }
    } else if (field === 'email' && !!req.user.email) {
      //break;
    } else if (req.body[field]) {
      data[field] = req.body[field];
    }
  });

  req.user
    .update(data)
    .then(() => {
      const authorizeUrl = `/dialog/authorize?redirect_uri=${redirectUrl}&response_type=code&client_id=${req.client.clientId}&scope=offline`;
      res.redirect(authorizeUrl);
    })
    .catch((err) => {
      next(err);
    });
};
