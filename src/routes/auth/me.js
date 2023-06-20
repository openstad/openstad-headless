const express = require('express');

let router = express.Router({mergeParams: true});

// me: translate bearer jwt to user data
// -------------------------------------
router
  .route('(/site/:siteId)?/me')
  .get(function (req, res, next) {
    const data = {
      "id": req.user.id,
      "complete": req.user.complete,
      "idpUser": req.user.role == 'admin' ? req.user.idpUser : null,
      "role": req.user.role,
      "email": req.user.email,
      "firstName": req.user.firstName,
      "lastName": req.user.lastName,
      "fullName": req.user.fullName,
      "nickName": req.user.nickName,
      "displayName": req.user.displayName,
      "initials": req.user.initials,
      "gender": req.user.gender,
      "extraData": req.user.extraData ? req.user.extraData : {},
      "phoneNumber": req.user.phoneNumber,
      "streetName": req.user.streetName,
      "city": req.user.city,
      "houseNumber": req.user.houseNumber,
      "suffix": req.user.suffix,
      "postcode": req.user.postcode,
      "zipCode": req.user.zipCode,
      "signedUpForNewsletter": req.user.signedUpForNewsletter,
      "createdAt": req.user.createdAt,
      "updatedAt": req.user.updatedAt,
      "deletedAt": req.user.deletedAt,
      'votes': req.user.votes
    };
    res.json(data);
  })

module.exports = router;
