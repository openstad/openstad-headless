// Keys that stay in extraData for every role, even when a resourceform config
// or a moderator-only field of the same name would otherwise strip them.
const ALWAYS_PUBLIC_EXTRA_DATA_KEYS = ['originalId', 'ranking'];

// Keys an editor sets outside the resourceform (e.g. in a dedicated admin
// field) that must survive the resourceform field-key filter below, but that
// a resourceform field marked onlyForModerator may still hide. Unlike
// ALWAYS_PUBLIC_EXTRA_DATA_KEYS, these do NOT win over moderatorOnlyExtraDataKeys.
const EDITOR_PUBLIC_EXTRA_DATA_KEYS = ['partnerLogo'];

// Because these keys are public, only an editor may write them; otherwise a
// participant could set one on their own resource. Passed to
// getExtraDataConfig as per-key auth defaults.
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

module.exports = {
  ALWAYS_PUBLIC_EXTRA_DATA_KEYS,
  EDITOR_PUBLIC_EXTRA_DATA_KEYS,
  EDITOR_PUBLIC_EXTRA_DATA_KEY_AUTH,
  filterPublicExtraData,
};
