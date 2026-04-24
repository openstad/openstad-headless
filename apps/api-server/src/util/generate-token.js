'use strict';

const { randomInt } = require('crypto');

let generateToken = function generateToken(params) {
  let token = '';

  params.chars =
    params.chars ||
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  params.length = params.length || 25;

  for (let i = 0; i < params.length; i++) {
    const rnd = randomInt(params.chars.length);
    const chr = params.chars.substring(rnd, rnd + 1);
    token = token + chr;
  }

  return token;
};

module.exports = generateToken;
