// If we have an object  with multiple keys, like `general`, `list` and `form`.
// This function will transform it into one object, with all underlying keys, for instance:
// { config: { general: { name: 'test' }, list: { active: false }, form: { intro: 'hi' } } }
// Will become:
// { name: 'test', active: false, intro: 'hi' }
function flattenObject (obj) {
  const flattened = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(flattened, flattenObject(obj[key]));
    } else {
      flattened[key] = obj[key];
    }
  });
  return flattened;
}

module.exports = flattenObject;
