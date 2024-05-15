const redis = require('redis');

let client = null;

async function getClient() {

  if (client) {
    return client.duplicate();
  }

  try {
    client = await redis.createClient({ url: process.env.MESSAGESTREAMING_REDIS_URL })
      .connect();
  } catch(err) {
    // console.log(err);
  }

  return client;

}

module.exports = {
  getPublisher: getClient,
  getSubscriber: getClient,
};