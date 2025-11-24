const config = require('config');

function getNestedValue(obj, path) {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

module.exports = function({ searchfields = ['title', 'summary', 'description'] }) {

  return function(req, res, next) {

    let search = req.query.search;

    // if no search query exists move on
    if (!search) return next();

    let list = req.results;

    // if results is not defined something weird happened
    if (typeof list === 'undefined') return next('No results defined to search in');

    let results = [];

    if (!Array.isArray(search)) search = [search];
    search.forEach((criterium) => {

      let key = Object.keys(criterium)[0];
      let value = criterium[key].toLowerCase(); // Converteer naar lowercase voor case-insensitieve vergelijking

      let useSearchFields;
      if (key === 'text') {
        useSearchFields = searchfields;
      } else {
        useSearchFields = searchfields.filter(field => field === key);
      }

      let searchTerms = value.split(' ');

      let searchResult = list.filter((item) => {
        return searchTerms.every((term) => {
          return useSearchFields.some((field) => {
            let fieldValue = getNestedValue(item, field);
            if (typeof fieldValue === 'string') {
              return fieldValue.toLowerCase().includes(term);
            }
            return false;
          });
        });
      });

      results.push(...searchResult);
    });


    let merged = Array.from(new Set(results));

    req.results = merged;

    return next();

  }
}
