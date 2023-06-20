const express = require('express');
let router = express.Router({mergeParams: true});

router
  .route('(/site/:siteId)?/login')
  .get(function (req, res, next) {
    console.log('LOGIN OPENSTAD');
  });

router
  .route('(/site/:siteId)?/logout')
  .get(function (req, res, next) {
    console.log('LOGOUT OPENSTAD');
  });

module.exports = { router };
