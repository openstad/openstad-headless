const config = require('config');
const fuzzysort = require('fuzzysort');

module.exports = function({ searchfields = ['title', 'summary', 'description'] }) {

  return function( req, res, next ) {

    let search = req.query.search;

  // if no search query exists move on
  if (!search) return next();

  let list = req.results;
  let results = [];

  if ( !Array.isArray(search.criteria) ) search.criteria = [ search.criteria ];
  search.criteria.forEach((criterium) => {

    let key = Object.keys(criterium)[0];
    let value = criterium[key];
    // todo: optional { fields: [], value: '' } construct

    let useSearchFields;
    if (key == 'text') {
      useSearchFields = searchfields;
    } else {
      useSearchFields = searchfields.filter( field => field == key );
    }

    let threshold = -5000;  // todo: tamelijk arbitrair; misschien moet je hem kunnen meesturen
    if (value.length < 4) threshold = -20000;
    if (value.length < 3) threshold = -50000;

    let searchResult = fuzzysort.go(value, list, {
      threshold,
      keys: useSearchFields,
    });
    
    results.push( searchResult );

  });

  // mergen van de resultaten
  let merged = [];
  if (results.length == 1) {
    merged = results[0];
  } else {
    if (search.options.andOr == 'and') {

      merged = [];
      for (let i=0; i<results.length; i++) {
        results[i].map( result => {

          let foundScore = -10e12;
          for (let j=i+1; j<results.length; j++) {
            let found = results[j].find( elem => elem.obj.id == result.obj.id );
            if (found && foundScore) {
              foundScore = Math.max(foundScore, found.score);
            } else {
              foundScore = undefined;
            }
          }

          if (foundScore && foundScore != -10e12) {
            // use highest score
            result.score = Math.max(result.score, foundScore);
            let found = merged.find( elem => elem.obj.id == result.obj.id );
            if (!found) {
              merged.push(result)
            }
          }

        })
      }
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

  }

  merged = merged.sort( (a,b) => b.score - a.score )
  merged = merged.map(elem => elem.obj);

  req.results = merged

  return next();

}
}
