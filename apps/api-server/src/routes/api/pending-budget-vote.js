const express = require('express');
const createError = require('http-errors');
const { v4: uuidv4 } = require('uuid');
const db = require('../../db');

const router = express.Router({ mergeParams: true });

// Create or update a pending budget vote selection
router.post('/', async function (req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return next(createError(400, 'Invalid payload'));
    }

    const id = uuidv4();

    const record = await db.PendingBudgetVote.create({
      id,
      data: req.body,
    });

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
        throw createError(404, 'Pending budget vote not found');
      }

      const data = record.data;
      await record.destroy({ transaction });

      return { id, data };
    });

    res.json(result);
  } catch (err) {
    console.log ('Error fetching pending budget vote:', err);
    next(err);
  }
});

module.exports = router;
