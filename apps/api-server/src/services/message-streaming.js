const config = require('config');
const redis = require('redis');

let client = null;

async function getClient() {
  let client;
  try {
    client = await redis.createClient(config.messageStreaming.redis)
      .connect();
  } catch(err) {
    //console.log(err);
  }

  return client;
}

module.exports = {
  getPublisher: getClient,
  getSubscriber: getClient,
};