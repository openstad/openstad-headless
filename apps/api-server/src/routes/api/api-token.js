const config = require('config');
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

function computeStatus(apiToken) {
  if (apiToken.deletedAt) return 'revoked';
  if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date())
    return 'expired';
  return 'active';
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
    status: computeStatus(apiToken),
  };
}

// Require admin or editor role on all api-token endpoints
function requireProjectAdminOrEditor(req, res, next) {
  if (!hasRole(req.user, ['admin', 'editor'])) {
    return next(createError(403, 'Insufficient permissions'));
  }
  if (!req.project) {
    return next(createError(404, 'Project not found'));
  }
  return next();
}

router.use(requireProjectAdminOrEditor);

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

// GET /project/:projectId/user/:userId/api-token — list masked tokens,
// including revoked and expired ones (status field tells them apart)
router.get('/', async function (req, res, next) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const projectId = req.project.id;

    const tokens = await db.ApiToken.findAll({
      where: { userId, projectId },
      paranoid: false,
      order: [['createdAt', 'DESC']],
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

// Project-level overview routes: /project/:projectId/api-token
const projectRouter = express.Router({ mergeParams: true });

projectRouter.use(requireProjectAdminOrEditor);

// GET /project/:projectId/api-token — all tokens for the project, including
// revoked and expired ones, with owner name and computed status
projectRouter.get('/', async function (req, res, next) {
  try {
    const projectId = req.project.id;
    const adminProjectId = config.admin.projectId;

    // Superuser tokens live on the admin project but can read every
    // project's stats, so they belong in every project's overview
    const projectIds =
      projectId == adminProjectId ? [projectId] : [projectId, adminProjectId];

    const tokens = await db.ApiToken.findAll({
      where: { projectId: projectIds },
      paranoid: false,
      include: [
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'nickName', 'name', 'email', 'role'],
          paranoid: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Admin-project tokens only grant cross-project access when the owner is
    // a superuser (mirrors the auth middleware check); hide the rest
    const visible = tokens.filter(
      (token) =>
        token.projectId == projectId ||
        ['admin', 'superuser'].includes(token.owner && token.owner.role)
    );

    return res.json(
      visible.map((token) => ({
        ...maskToken(token),
        isSuperUserToken: token.projectId != projectId,
        owner: token.owner
          ? {
              id: token.owner.id,
              name:
                token.owner.displayName ||
                token.owner.name ||
                token.owner.email ||
                null,
            }
          : null,
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// DELETE below intentionally matches on the viewed project's id only: a
// superuser token shown in another project's overview cannot be revoked by
// that project's admins/editors — only from the admin project or the owner's
// user page.

// DELETE /project/:projectId/api-token/:tokenId — revoke from the overview
projectRouter.delete('/:tokenId(\\d+)', async function (req, res, next) {
  try {
    const projectId = req.project.id;
    const tokenId = parseInt(req.params.tokenId, 10);

    const token = await db.ApiToken.findOne({
      where: { id: tokenId, projectId },
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
module.exports.projectRouter = projectRouter;
