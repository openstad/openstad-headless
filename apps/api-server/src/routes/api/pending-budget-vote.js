const express = require('express');
const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');

const router = express.Router({ mergeParams: true });

// A real selection is a handful of resource ids; the global body limit is 10mb
const MAX_PAYLOAD_BYTES = 64 * 1024;

// Create or update a pending budget vote selection
router.post('/', rateLimiter(), async function (req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return next(createError(400, 'Invalid payload'));
    }

    if (Buffer.byteLength(JSON.stringify(req.body)) > MAX_PAYLOAD_BYTES) {
      return next(createError(413, 'Payload too large'));
    }

    const id = uuidv4();

    const record = await db.PendingBudgetVote.create({
      id,
      data: req.body,
    });

    const resourceCount = req.body ? Object.keys(req.body).length : 0;
    console.log(
      `[${new Date().toISOString()}][pending-vote] created: id=${record.id} resources=${resourceCount}`
    );
    res.json({ id: record.id });
  } catch (err) {
    next(err);
  }
});

// Fetch and delete a pending budget vote selection
router.get('/:id', async function (req, res, next) {
  try {
    const { id } = req.params;
    if (!id) return next(createError(400, 'ID is required'));

    const result = await db.sequelize.transaction(async (transaction) => {
      const record = await db.PendingBudgetVote.findOne({
        where: { id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!record) {
        console.log(
          `[${new Date().toISOString()}][pending-vote] not found: id=${id}`
        );
        throw createError(404, 'Pending budget vote not found');
      }

      const data = record.data;
      await record.destroy({ transaction });

      const resourceCount = data ? Object.keys(data).length : 0;
      console.log(
        `[${new Date().toISOString()}][pending-vote] consumed: id=${id} resources=${resourceCount}`
      );
      return { id, data };
    });

    res.json(result);
  } catch (err) {
    if (err.status !== 404) {
      console.log(
        `[${new Date().toISOString()}][pending-vote] fetch error: id=${req.params?.id} error=${err?.message}`
      );
    }
    next(err);
  }
});

module.exports = router;
