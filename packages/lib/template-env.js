const nunjucks = require('nunjucks');

// Nunjucks environment for templates written by project editors and admins
// (notification mails, login mails). Nunjucks has no sandbox: every value
// exposes `constructor` (and therefore `Function`), bare names are looked up
// in plain objects (so `Object.prototype` members are reachable and a `set`
// on `__proto__` rewires the lookup), and every function a template can reach
// can be called. While a hardened environment renders, the guards below hide
// prototype escape hatches, resolve bare names to own properties only, strip
// functions from loop iterables and never hand back a function. Templates keep
// plain property access, `if`/`for`/`set`, `extends`/`block` and filters;
// macros and method calls are not available. Other environments in the same
// process are not affected.
const DENIED_KEYS = new Set(['constructor', '__proto__', 'prototype']);
const DENIED_GLOBALS = ['range', 'cycler', 'joiner'];

let guardDepth = 0;
const runtime = nunjucks.runtime;
const original = {
  memberLookup: runtime.memberLookup,
  contextOrFrameLookup: runtime.contextOrFrameLookup,
  fromIterator: runtime.fromIterator,
};

const hasOwn = (obj, key) =>
  obj != null && Object.prototype.hasOwnProperty.call(obj, key);

function safeValue(value) {
  return typeof value === 'function' ? undefined : value;
}

runtime.memberLookup = function guardedMemberLookup(obj, val) {
  if (guardDepth === 0) return original.memberLookup(obj, val);
  if (DENIED_KEYS.has(String(val))) return undefined;
  return safeValue(original.memberLookup(obj, val));
};

runtime.contextOrFrameLookup = function guardedContextOrFrameLookup(
  context,
  frame,
  name
) {
  if (guardDepth === 0) {
    return original.contextOrFrameLookup(context, frame, name);
  }
  if (DENIED_KEYS.has(name)) return undefined;
  for (let f = frame; f; f = f.parent) {
    if (hasOwn(f.variables, name)) return safeValue(f.variables[name]);
  }
  if (hasOwn(context.ctx, name)) return safeValue(context.ctx[name]);
  const globals = context.env && context.env.globals;
  if (hasOwn(globals, name)) return safeValue(globals[name]);
  return undefined;
};

runtime.fromIterator = function guardedFromIterator(arr) {
  const value = original.fromIterator(arr);
  if (guardDepth === 0) return value;
  if (Array.isArray(value)) return value.map(safeValue);
  if (value && typeof value === 'object') {
    const copy = {};
    for (const key of Object.keys(value)) {
      if (!DENIED_KEYS.has(key)) copy[key] = safeValue(value[key]);
    }
    return copy;
  }
  return value;
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

function toPlainValue(value, seen) {
  if (value == null || typeof value !== 'object') return value;
  if (Buffer.isBuffer(value) || ArrayBuffer.isView(value)) return value;
  if (!seen) seen = new Set();
  if (seen.has(value)) return undefined;
  seen.add(value);
  if (value instanceof Date || value instanceof RegExp) return value;
  if (Array.isArray(value)) return value.map((v) => toPlainValue(v, seen));
  if (typeof value.get === 'function' && value.sequelize) {
    return toPlainValue(value.get({ plain: true }), seen);
  }
  const copy = {};
  for (const [key, v] of Object.entries(value)) {
    if (
      key === 'sequelize' ||
      key === '_previousDataValues' ||
      key === '__proto__'
    )
      continue;
    copy[key] = toPlainValue(v, seen);
  }
  return copy;
}

module.exports = { createTemplateEnv, toPlainData };
