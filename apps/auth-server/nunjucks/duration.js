let i18nNames = [
  ['years', 'jaar', 'jaren'],
  ['weeks', 'week', 'weken'],
  ['days', 'dag', 'dagen'],
  ['hours', 'uur', 'uren'],
  ['minutes', 'minuut', 'minuten'],
  ['seconds', 'seconde', 'seconden'],
]

let oneYear = 365.25 * 24 * 60 * 60 * 1000;
let oneWeek = 7 * 24 * 60 * 60 * 1000;
let oneDay = 24 * 60 * 60 * 1000;
let oneHour = 60 * 60 * 1000;
let oneMinute = 60 * 1000;
let oneSecond = 1000;

function duration( ms ) {

  let durationObject = {};

  durationObject.years = parseInt( ms / oneYear );
  ms = ms - durationObject.years * oneYear;

  durationObject.weeks = parseInt( ms / oneWeek );
  ms = ms - durationObject.weeks * oneWeek;

  durationObject.days = parseInt( ms / oneDay );
  ms = ms - durationObject.days * oneDay;

  durationObject.hours = parseInt( ms / oneHour );
  ms = ms - durationObject.hours * oneHour;

  durationObject.minutes = parseInt( ms / oneMinute );
  ms = ms - durationObject.minutes * oneMinute;

  durationObject.seconds = parseInt( ms / oneSecond );
  ms = ms - durationObject.seconds * oneSecond;

  return i18nNames
    .filter(entry => durationObject[ entry[0] ] && durationObject[ entry[0] ] !== 0)
    .map(entry => `${durationObject[ entry[0] ]} ${ durationObject[ entry[0] ] ==1 ? entry[1] : entry[2] }`)
    .join(', ');
};

module.exports = duration;
