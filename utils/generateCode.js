module.exports = () => {
  var text = "";
  var numbers = "23456789";
  var letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  var even = false;

  for (var i = 0; i < 12; i++) {
    let charsToChose = even ? numbers : letters;
    text += charsToChose.charAt(Math.floor(Math.random() * charsToChose.length));
    even = !even;
  }

  return text;
}
