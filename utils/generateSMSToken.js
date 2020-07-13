module.exports = () => {
  var text = "";
  var chars = "12346798abcdefghijkmnopqrstuvwxyz";
  var even = false;

  for (var i = 0; i < 5; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return text;
}
