const nunjucks = require('nunjucks');

// Nunjucks environment for templates written by project editors and admins
// (notification mails, login mails). Nunjucks has no sandbox: every value
// exposes `constructor` (and therefore `Function`) and every function reachable
// from the context can be called. While a hardened environment renders, the
// member lookup below hides prototype escape hatches and never hands back a
// function. Templates keep plain property access, `if`/`for`/`set`, `extends`
// and filters. Other environments in the same process are not affected.
const DENIED_KEYS = new Set(['constructor', '__proto__', 'prototype']);
const DENIED_GLOBALS = ['range', 'cycler', 'joiner'];

let guardDepth = 0;
const originalMemberLookup = nunjucks.runtime.memberLookup;

nunjucks.runtime.memberLookup = function guardedMemberLookup(obj, val) {
  if (guardDepth === 0) return originalMemberLookup(obj, val);
  if (DENIED_KEYS.has(String(val))) return undefined;
  const result = originalMemberLookup(obj, val);
  return typeof result === 'function' ? undefined : result;
};

function guarded(fn) {
  return function () {
    guardDepth++;
    try {
      return fn.apply(this, arguments);
    } finally {
      guardDepth--;
    }
  };
}

/**
 * @param {object} [options]
 * @param {import('nunjucks').ILoader[]} [options.loaders] Loaders for
 *   `{% extends %}` / `{% include %}`. Default: none, so templates cannot read
 *   files (without this argument Nunjucks installs a FileSystemLoader).
 */
function createTemplateEnv({ loaders = [] } = {}) {
  const env = new nunjucks.Environment(loaders);
  for (const name of DENIED_GLOBALS) delete env.globals[name];
  env.render = guarded(env.render);
  env.renderString = guarded(env.renderString);
  return env;
}

// Sequelize instances carry a `sequelize` handle and methods such as
// `destroy()`; hand the template plain data only.
function toPlainData(data) {
  const plain = {};
  for (const [key, value] of Object.entries(data || {})) {
    plain[key] = toPlainValue(value);
  }
  return plain;
}

function toPlainValue(value) {
  if (Array.isArray(value)) return value.map(toPlainValue);
  if (value && typeof value.get === 'function' && value.sequelize) {
    return value.get({ plain: true });
  }
  return value;
}

module.exports = { createTemplateEnv, toPlainData };
