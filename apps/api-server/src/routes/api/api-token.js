const express = require('express');
const crypto = require('crypto');
const createError = require('http-errors');
const db = require('../../db');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const router = express.Router({ mergeParams: true });

const VALID_MONTHS = { 1: 1, 3: 3, 12: 12 };

function mintToken() {
  const raw = crypto.randomBytes(32).toString('base64url');
  const plaintext = 'osr_' + raw;
  const tokenHash = crypto.createHash('sha256').update(plaintext).digest('hex');
  const tokenPrefix = plaintext.slice(0, 8);
  const lastFour = plaintext.slice(-4);
  return { plaintext, tokenHash, tokenPrefix, lastFour };
}

function computeExpiresAt(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

function maskToken(apiToken) {
  return {
    id: apiToken.id,
    userId: apiToken.userId,
    projectId: apiToken.projectId,
    name: apiToken.name,
    tokenPrefix: apiToken.tokenPrefix,
    lastFour: apiToken.lastFour,
    expiresAt: apiToken.expiresAt,
    lastUsedAt: apiToken.lastUsedAt,
    createdAt: apiToken.createdAt,
  };
}

// Require admin role on all api-token endpoints. Mirrors the ApiToken model
// auth (createableBy/deleteableBy: 'admin'); a reporting token inherits its
// owner's permissions, so minting/revoking is an admin-only action.
function requireProjectAdmin(req, res, next) {
  if (!hasRole(req.user, ['admin'])) {
    return next(createError(403, 'Insufficient permissions'));
  }
  if (!req.project) {
    return next(createError(404, 'Project not found'));
  }
  return next();
}

router.use(requireProjectAdmin);

// POST /project/:projectId/user/:userId/api-token — create a token (returned in plaintext once)
router.post('/', async function (req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const projectId = req.project.id;
    const { months: monthsStr, name } = req.body;

    // Validity period is optional: an empty / 'none' value means the token
    // never expires. A provided value must be one of the allowed presets.
    let expiresAt = null;
    const hasPeriod =
      monthsStr !== undefined &&
      monthsStr !== null &&
      monthsStr !== '' &&
      monthsStr !== 'none';
    if (hasPeriod) {
      const months = VALID_MONTHS[String(monthsStr)];
      if (!months) {
        return next(
          createError(
            400,
            'Invalid validity period. Choose 1, 3, or 12 months, or none.'
          )
        );
      }
      expiresAt = computeExpiresAt(months);
    }

    // Verify the target user belongs to this project
    const targetUser = await db.User.findOne({
      where: { id: userId, projectId },
    });
    if (!targetUser) {
      return next(createError(404, 'User not found in this project'));
    }

    const { plaintext, tokenHash, tokenPrefix, lastFour } = mintToken();

    const token = await db.ApiToken.create({
      userId,
      projectId,
      name: name || null,
      tokenHash,
      tokenPrefix,
      lastFour,
      expiresAt,
    });

    return res.status(201).json({
      ...maskToken(token),
      token: plaintext, // returned in plaintext ONCE
    });
  } catch (err) {
    return next(err);
  }
});

// GET /project/:projectId/user/:userId/api-token — list masked tokens
router.get('/', async function (req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const projectId = req.project.id;

    const tokens = await db.ApiToken.findAll({
      where: { userId, projectId },
      order: [['createdAt', 'DESC']],
    });

    return res.json(tokens.map(maskToken));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
