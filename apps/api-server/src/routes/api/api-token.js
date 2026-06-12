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

// Require admin or editor role on all api-token endpoints
router.use(function (req, res, next) {
  if (!hasRole(req.user, ['admin', 'editor'])) {
    return next(createError(403, 'Insufficient permissions'));
  }
  if (!req.project) {
    return next(createError(404, 'Project not found'));
  }
  return next();
});

// POST /project/:projectId/user/:userId/api-token — create a token (returned in plaintext once)
router.post('/', async function (req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const projectId = req.project.id;
    const { months: monthsStr, name } = req.body;

    const months = VALID_MONTHS[String(monthsStr)];
    if (!months) {
      return next(
        createError(400, 'Invalid validity period. Choose 1, 3, or 12 months.')
      );
    }

    // Verify the target user belongs to this project
    const targetUser = await db.User.findOne({
      where: { id: userId, projectId },
    });
    if (!targetUser) {
      return next(createError(404, 'User not found in this project'));
    }

    const { plaintext, tokenHash, tokenPrefix, lastFour } = mintToken();
    const expiresAt = computeExpiresAt(months);

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
    });

    return res.json(tokens.map(maskToken));
  } catch (err) {
    return next(err);
  }
});

// DELETE /project/:projectId/user/:userId/api-token/:tokenId — revoke (soft-delete)
router.delete('/:tokenId(\\d+)', async function (req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const projectId = req.project.id;
    const tokenId = parseInt(req.params.tokenId, 10);

    const token = await db.ApiToken.findOne({
      where: { id: tokenId, userId, projectId },
    });

    if (!token) {
      return next(createError(404, 'Token not found'));
    }

    await token.destroy(); // paranoid soft-delete
    return res.json({ status: 'ok' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
