const config = require('config');
const fuzzysort = require('fuzzysort');

module.exports = function({ searchfields = ['title', 'summary', 'description'] }) {

  return function( req, res, next ) {

    let search = req.query.search;

    // if no search query exists move on
    if (!search) return next();

    let list = req.results;

    // if results is not defined something weird happened
    if (typeof list === 'undefined') return next('No reaults defined to search in');

    let results = [];

    if ( !Array.isArray(search) ) search = [ search ];
    search.forEach((criterium) => {

      let key = Object.keys(criterium)[0];
      let value = criterium[key].toLowerCase(); // Converteer naar lowercase voor case-insensitieve vergelijking

      let useSearchFields;
      if (key == 'text') {
        useSearchFields = searchfields;
      } else {
        useSearchFields = searchfields.filter(field => field == key);
      }

      // Split de zoekwaarde op in losse woorden
      let searchTerms = value.split(' ');

      let allResults = [];

      searchTerms.forEach(term => {
        let searchResult = fuzzysort.go(term, list, {
          keys: useSearchFields,
          threshold: -200,
          allowTypo: true
        });

        allResults.push(...searchResult);
      });

      results.push(allResults);
    });

    // mergen van de resultaten
    let merged = [];
    if (results.length == 1) {
      merged = results[0];
    } else {
      merged = [];
      for (let i=0; i<results.length; i++) {
        results[i].map( result => {
          let found = merged.find( elem => elem.obj.id == result.obj.id );
          if (found) {
            // use highest score
            found.score = Math.max(found.score, result.score)
          } else {
            merged.push(result)
          }
        })
      }

    }

    if (!req.dbQuery.order) {
      merged = merged.sort( (a,b) => b.score - a.score )
    }
    merged = merged.map(elem => elem.obj);

    req.results = merged

    return next();

  }
}
