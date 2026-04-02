const express = require('express');
const db = require('../../db');
const pagination = require('../../middleware/pagination');
const auditLogService = require('../../services/audit-log');

let router = express.Router({ mergeParams: true });

// Auth check: only admins can query audit logs
function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (
    user.role === 'admin' ||
    user.role === 'superuser' ||
    user.role === 'editor'
  ) {
    return next();
  }
  return res.status(403).json({ error: 'Insufficient permissions' });
}

function requireSuperuser(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  if (user.role === 'superuser') return next();
  return res.status(403).json({ error: 'Superuser role required' });
}

function requireInternalToken(req, res, next) {
  const token = process.env.AUDIT_INTERNAL_TOKEN;
  if (!token) {
    return res
      .status(503)
      .json({ error: 'Internal audit token not configured' });
  }

  const authHeader =
    req.headers['x-audit-token'] || req.headers['authorization'];
  const provided = authHeader?.replace('Bearer ', '');

  if (provided !== token) {
    return res.status(403).json({ error: 'Invalid internal token' });
  }
  next();
}

// GET /api/audit-log or /api/project/:projectId/audit-log
router.get('/', requireAdmin, pagination.init, async function (req, res, next) {
  try {
    const where = {};
    const { modelName, modelId, userId, action, source, fromDate, toDate } =
      req.query;

    if (req.params.projectId) {
      where.projectId = parseInt(req.params.projectId);
    }
    if (modelName) where.modelName = modelName;
    if (modelId) where.modelId = parseInt(modelId);
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;
    if (source) where.source = source;

    if (fromDate || toDate) {
      const { Op } = require('sequelize');
      where.createdAt = {};
      if (fromDate) where.createdAt[Op.gte] = new Date(fromDate);
      if (toDate) where.createdAt[Op.lte] = new Date(toDate);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 100);
    const offset = (page - 1) * pageSize;

    const { count, rows } = await db.AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    res.json({
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
      records: rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/audit-log/auth-event — internal endpoint for auth-server
router.post(
  '/auth-event',
  requireInternalToken,
  async function (req, res, next) {
    try {
      const {
        projectId,
        userId,
        userName,
        userRole,
        action,
        modelName,
        modelId,
        newData,
        ipAddress,
        hostname,
        userAgent,
        routePath,
        statusCode,
      } = req.body;

      if (!action || !modelName) {
        return res
          .status(400)
          .json({ error: 'action and modelName are required' });
      }

      const entry = {
        projectId: projectId || null,
        userId: userId || null,
        userName: userName || null,
        userRole: userRole || null,
        action,
        modelName,
        modelId: modelId || null,
        previousData: null,
        newData: newData || null,
        ipAddress: ipAddress || null,
        hostname: hostname || null,
        userAgent: userAgent || null,
        routePath: routePath || null,
        statusCode: statusCode || null,
        source: 'auth',
      };

      auditLogService.logDirect(entry);

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/project/:projectId/audit-log/incident
router.put('/incident', requireSuperuser, async function (req, res, next) {
  try {
    const projectId = parseInt(req.params.projectId);
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const project = await db.Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update({ auditIncidentAt: new Date() });
    res.json({ success: true, auditIncidentAt: project.auditIncidentAt });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/project/:projectId/audit-log/incident
router.delete('/incident', requireSuperuser, async function (req, res, next) {
  try {
    const projectId = parseInt(req.params.projectId);
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const project = await db.Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update({ auditIncidentAt: null });
    res.json({ success: true, auditIncidentAt: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
