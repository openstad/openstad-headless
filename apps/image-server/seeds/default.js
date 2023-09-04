const hat = require('hat');

module.exports = async function seed(db) {

  const rack = hat.rack();
  const clientToken = process.env.FIRST_IMAGE_API_ACCESS_TOKEN ? process.env.FIRST_IMAGE_API_ACCESS_TOKEN : rack();
  console.log('  creating client with clientToken', clientToken);

  await db.Client.create({
    id: 1,
    clientName: 'image-server-client',
    token: clientToken, //deprecated 
    displayName: "Image server client",
  });

}
