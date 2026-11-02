var moment = require('moment-timezone');
var nlib = require('nunjucks/src/lib');
var slice = Array.prototype.slice;

// Is set via `setDefaultFormat`.
var defaultFormat = 'Do MMMM, YYYY';

var ALLOWED_METHODS = new Set([
  'format', 'fromNow', 'from', 'toNow', 'to', 'calendar',
  'toISOString', 'toJSON', 'toString', 'unix', 'valueOf',
  'diff', 'daysInMonth',
  'isBefore', 'isAfter', 'isSame', 'isSameOrBefore', 'isSameOrAfter',
  'isBetween', 'isValid',
  'year', 'month', 'date', 'day', 'hour', 'minute', 'second',
  'startOf', 'endOf', 'locale', 'utc', 'local',
]);

moment.locale('nl');

// Examples:
// {{ var | date }}
// {{ var | date('YYYY-MM-DD') }}
function dateFilter(date, format) {
  try {
    if (!date) {
      throw Error('Onbekende datum');
    }
    // Timezone is set in `config/moment.js`.
    var mom = moment(date);
    return nlib.isFunction(mom[format]) && ALLOWED_METHODS.has(format)
      ? mom[format].apply(mom, slice.call(arguments, 2))
      : mom.format(format || defaultFormat);
  } catch (error) {
    return (error.message || 'dateFilter error').toString();
  }
}

// Set default format for date.
dateFilter.setDefaultFormat = function (format) {
  defaultFormat = format;
};

module.exports = dateFilter;
