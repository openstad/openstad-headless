const express = require('express');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const db = require('../../db');

let router = express.Router({mergeParams: true});

// me: translate bearer jwt to user data
// -------------------------------------
router
  .route('(/project/:projectId)?/me')
  .get(async function (req, res, next) {
    if (!req.user || !req.user.id) return res.json({});

    let userNickName = '';

    try {
      const user = await db.User.findOne({
        where: { id: req.user.id, projectId: req.params.projectId }
      });

      userNickName = user?.nickName || '';
    } catch (error) {
      next(error);
    }

    const data = {
      id: req.user.id,
      projectId: req.user.projectId,
      complete: req.user.complete,
      idpUser: hasRole( req.user, 'admin' ) ? req.user.idpUser : { provider: req.user.idpUser.provider },
      role: req.user.role,
      email: req.user.email,
      name: req.user.name,
      nickName: req.user.nickName || userNickName,
      displayName: req.user.displayName,
      initials: req.user.initials,
      extraData: req.user.extraData ? req.user.extraData : {},
      phoneNumber: req.user.phoneNumber,
      address: req.user.address,
      city: req.user.city,
      country: req.user.country,
      postcode: req.user.postcode,
      zipCode: req.user.zipCode,
      votes: req.user.votes,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
      deletedAt: req.user.deletedAt,
    };
    res.json(data);
  })

module.exports = router;
