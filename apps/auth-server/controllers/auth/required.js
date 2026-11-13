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
    if (!field) return false;

    // Consent field is a special case since it can contain multiple client IDs
    if (field?.key === 'emailNotificationConsent') {
      const clientId = String(req?.client?.id);

      const currentValue = req?.user?.emailNotificationConsent || {};
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

  res.render('auth/required-fields', {
    client: sanitize.client(req.client),
    clientId: sanitize.plainText(req.client.clientId),
    requiredFields: requiredUserFields,
    info: sanitize.safeTags(configRequiredFields.info),
    description: sanitize.safeTags(configRequiredFields.description),
    title: sanitize.safeTags(configRequiredFields.title),
    buttonText: sanitize.safeTags(configRequiredFields.buttonText),
    redirect_uri: req.redirectUri ? encodeURIComponent(req.redirectUri) : '',
  });
};

exports.post = (req, res, next) => {
  const clientRequiredUserFields = req.client.requiredUserFields;
  const redirectUrl = req.redirectUri
    ? encodeURIComponent(req.redirectUri)
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
