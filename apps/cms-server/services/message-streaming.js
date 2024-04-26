const redis = require('redis');

let client = null;

async function getClient() {

  if (client) {
    return client.duplicate();
  }

  client = await redis.createClient({ url: process.env.MESSAGESTREAMING_REDIS_URL })
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
  return client;

}

module.exports = {
  getPublisher: getClient,
  getSubscriber: getClient,
};
