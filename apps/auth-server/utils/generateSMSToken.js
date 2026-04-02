const { randomInt } = require('crypto');

module.exports = () => {
  var text = '';
  var chars = '12346798abcdefghijkmnopqrstuvwxyz';

  for (var i = 0; i < 5; i++) {
    text += chars.charAt(randomInt(chars.length));
  }

  return text;
};
