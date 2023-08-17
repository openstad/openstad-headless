const Sequelize = require('sequelize');

/**
 * Returns sequelize errors
 * @param error
 * @returns {*[]}
 */
module.exports = function getSequelizeErrors (error) {
  const errors = [];
  if( typeof error == 'object' && error instanceof Sequelize.ValidationError ) {
    error.errors.forEach(function (error) {
      // notNull kent geen custom messages in deze versie van sequelize; zie https://github.com/sequelize/sequelize/issues/1500
      // TODO: we zitten op een nieuwe versie van seq; vermoedelijk kan dit nu wel
      errors.push(error.type === 'notNull Violation' && error.path === 'location' ? 'Kies een locatie op de kaart' : error.message);
    });
  }

  return errors;
}
