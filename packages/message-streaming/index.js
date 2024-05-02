const redis = require('redis');

async function publish(channel, message) {
  try {

    if (process.env.MESSAGESTREAMING_POSTFIX) {
      channel = `${channel}-${process.env.MESSAGESTREAMING_POSTFIX}`;
    }

    let publisher = await redis.createClient({ url: process.env.MESSAGESTREAMING_REDIS_URL }).connect();
    if (publisher) {
      await publisher.publish(channel, message);
    } else {
      console.log('No publisher found')
    }

  } catch(err) {
    // console.log(err);
  }
}

let subscriber = null;
async function subscribe(channel, handler) {
  try {

    if (process.env.MESSAGESTREAMING_POSTFIX) {
      channel = `${channel}-${process.env.MESSAGESTREAMING_POSTFIX}`;
    }

    let subscriber = await redis.createClient({ url: process.env.MESSAGESTREAMING_REDIS_URL }).connect();
    if (subscriber) {
      await subscriber.subscribe(channel, handler);
    } else {
      console.log('No subscriber found')
    }

    return subscriber;

  } catch(err) {
    // console.log(err);
  }
}

module.exports = {
  publish,
  subscribe,
};
