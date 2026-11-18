const sanitize = require('../util/sanitize');

const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/g;

function hasModBreakContent(description) {
  if (typeof description !== 'string' || !description) return false;
  return (
    sanitize
      .noTags(description)
      .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
      .replace(INVISIBLE_CHARACTERS, '')
      .trim().length > 0
  );
}

module.exports = hasModBreakContent;
