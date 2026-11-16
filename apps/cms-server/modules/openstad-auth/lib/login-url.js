const {
  shouldForceNewLoginByDefault,
} = require('@openstad-headless/lib/force-new-login');

const loginUrlSuffix = ({ privileged, project, env = process.env }) => {
  if (privileged) return '&loginPriviliged=1';
  return shouldForceNewLoginByDefault(project, env) ? '&forceNewLogin=1' : '';
};

module.exports = { loginUrlSuffix };
