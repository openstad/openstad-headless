const express = require('express');
const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');

const router = express.Router({ mergeParams: true });

// Create or update a pending budget vote selection
router.post('/', async function (req, res, next) {
  try {
    console.log('[pending-vote-debug][route] POST /api/pending-budget-vote start', {
      hasAuthorization: !!req.headers.authorization,
      origin: req.headers.origin,
      projectId: req.project && req.project.id,
      userId: req.user && req.user.id,
      payloadKeys: req.body && typeof req.body === 'object' ? Object.keys(req.body).length : 0,
    });
    if (!req.body || typeof req.body !== 'object') {
      return next(createError(400, 'Invalid payload'));
    }

    const id = uuidv4();

    const record = await db.PendingBudgetVote.create({
      id,
      data: req.body,
    });

    console.log('[pending-vote-debug][route] POST /api/pending-budget-vote success', {
      id: record.id,
      createdAt: record.createdAt,
    });
    res.json({ id: record.id });
  } catch (err) {
    console.log('[pending-vote-debug][route] POST /api/pending-budget-vote error', {
      message: err && err.message,
    });
    next(err);
  }
});

// Fetch and delete a pending budget vote selection
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    console.log('[pending-vote-debug][route] GET /api/pending-budget-vote/:id start', {
      id,
      hasAuthorization: !!req.headers.authorization,
      origin: req.headers.origin,
      projectId: req.project && req.project.id,
      userId: req.user && req.user.id,
    });
    if (!id) return next(createError(400, 'ID is required'));

    const result = await db.sequelize.transaction(async (transaction) => {
      const record = await db.PendingBudgetVote.findOne({
        where: { id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!record) {
        console.log('[pending-vote-debug][route] GET pending vote not found', { id });
        throw createError(404, 'Pending budget vote not found');
      }

      const data = record.data;
      console.log('[pending-vote-debug][route] GET pending vote found before delete', {
        id,
        createdAt: record.createdAt,
        dataKeys: data && typeof data === 'object' ? Object.keys(data).length : 0,
      });
      await record.destroy({ transaction });
      console.log('[pending-vote-debug][route] GET pending vote deleted', { id });

      return { id, data };
    });

    console.log('[pending-vote-debug][route] GET /api/pending-budget-vote/:id success', { id });
    res.json(result);
  } catch (err) {
    console.log('[pending-vote-debug][route] GET /api/pending-budget-vote/:id error', {
      id: req.params && req.params.id,
      message: err && err.message,
    });
    console.log ('Error fetching pending budget vote:', err);
    next(err);
  }
});

module.exports = router;
