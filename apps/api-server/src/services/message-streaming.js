const config = require('config');
const redis = require('redis');

let client = null;

async function getClient() {
  return redis.createClient(config.messageStreaming.redis)
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
}

module.exports = {
  getPublisher: getClient,
  getSubscriber: getClient,
};
