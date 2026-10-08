const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const ALWAYS_PUBLIC_EXTRA_DATA_KEYS = ['originalId', 'ranking'];

const EDITOR_PUBLIC_EXTRA_DATA_KEYS = ['partnerLogo'];

const EDITOR_PUBLIC_EXTRA_DATA_KEY_AUTH = Object.fromEntries(
  EDITOR_PUBLIC_EXTRA_DATA_KEYS.map((key) => [
    key,
    { createableBy: 'editor', updateableBy: 'editor' },
  ])
);

function filterPublicExtraData(
  data,
  { hasResourceFormConfig, resourceFormFieldKeys, moderatorOnlyExtraDataKeys }
) {
  resourceFormFieldKeys = Array.isArray(resourceFormFieldKeys)
    ? resourceFormFieldKeys
    : [];
  moderatorOnlyExtraDataKeys = Array.isArray(moderatorOnlyExtraDataKeys)
    ? moderatorOnlyExtraDataKeys
    : [];

  if (hasResourceFormConfig) {
    Object.keys(data.extraData).forEach((key) => {
      if (
        !resourceFormFieldKeys.includes(key) &&
        !ALWAYS_PUBLIC_EXTRA_DATA_KEYS.includes(key) &&
        !EDITOR_PUBLIC_EXTRA_DATA_KEYS.includes(key)
      ) {
        delete data.extraData[key];
      }
    });
  } else {
    const preserved = {};
    [
      ...ALWAYS_PUBLIC_EXTRA_DATA_KEYS,
      ...EDITOR_PUBLIC_EXTRA_DATA_KEYS,
    ].forEach((key) => {
      if (data.extraData[key] !== undefined)
        preserved[key] = data.extraData[key];
    });
    data.extraData = preserved;
  }

  moderatorOnlyExtraDataKeys.forEach((key) => {
    if (!ALWAYS_PUBLIC_EXTRA_DATA_KEYS.includes(key)) {
      delete data.extraData[key];
    }
  });

  return data;
}

function stripEditorOnlyExtraData(extraData, user) {
  if (!extraData || typeof extraData !== 'object') return extraData;
  if (hasRole(user, 'editor')) return extraData;

  const stripped = { ...extraData };
  EDITOR_PUBLIC_EXTRA_DATA_KEYS.forEach((key) => {
    delete stripped[key];
  });
  return stripped;
}

module.exports = {
  ALWAYS_PUBLIC_EXTRA_DATA_KEYS,
  EDITOR_PUBLIC_EXTRA_DATA_KEYS,
  EDITOR_PUBLIC_EXTRA_DATA_KEY_AUTH,
  filterPublicExtraData,
  stripEditorOnlyExtraData,
};
