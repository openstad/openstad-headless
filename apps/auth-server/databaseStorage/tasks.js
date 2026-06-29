'use strict';

const merge = require('merge');
const db = require('../db');

let Tasks = {};

const MAX_TASK_AGE = 60 * 60 * 1000; // milliseconds

/**
 * Returns a task if it finds one, otherwise returns undefined.
 * @param   {String}  taskId - The task to find.
 * @returns {Promise} resolved with the task
 */
Tasks.find = async (taskId) => {
  await Tasks.cleanUp();

  return db.Task.findOne({ where: { taskId } })
    .then((record) => {
      if (!record) return undefined;
      return {
        ...record.data,
        taskId: record.taskId,
        lastUpdateDate: record.lastUpdateDate,
      };
    })
    .catch((e) => {
      console.warn('Error finding task: ', e);
      return undefined;
    });
};

/**
 * Update or create a task
 * @param   {String}  taskId  - The taskId (required)
 * @param   {Object}  newData - The data to be stored
 * @returns {Promise} resolved with the task
 */
Tasks.save = async (taskId, newData) => {
  taskId = taskId || String(parseInt(Math.random() * 10000000) + 10000000);

  const existing = await db.Task.findOne({ where: { taskId } }).catch(
    () => null
  );

  if (existing) {
    const oldData = existing.data || {};
    const merged = merge.recursive(oldData, newData, {
      taskId,
      lastUpdateDate: Date.now(),
    });
    await existing.update({ data: merged, lastUpdateDate: Date.now() });
    return { ...merged, taskId, lastUpdateDate: Date.now() };
  }

  const data = merge.recursive({}, newData, {
    taskId,
    lastUpdateDate: Date.now(),
  });

  const record = await db.Task.create({
    taskId,
    data,
    lastUpdateDate: Date.now(),
  });

  return {
    ...record.data,
    taskId: record.taskId,
    lastUpdateDate: record.lastUpdateDate,
  };
};

/**
 * Deletes a task
 * @param   {String}  taskId - The id of the task to delete.
 * @returns {Promise} resolved with the deleted task
 */
Tasks.delete = async (taskId) => {
  const record = await db.Task.findOne({ where: { taskId } }).catch(() => null);
  if (!record) return undefined;

  const data = {
    ...record.data,
    taskId: record.taskId,
    lastUpdateDate: record.lastUpdateDate,
  };
  await record.destroy();
  return data;
};

/**
 * Removes all tasks.
 * @returns {Promise} resolved when all tasks are removed
 */
Tasks.removeAll = () => {
  return db.Task.destroy({ where: {} });
};

/**
 * Removes old tasks.
 * @returns {Promise} resolved with undefined
 */
Tasks.cleanUp = async () => {
  const cutoff = Date.now() - MAX_TASK_AGE;

  await db.Task.destroy({
    where: {
      lastUpdateDate: {
        [db.Sequelize.Op.lt]: cutoff,
      },
    },
  }).catch((e) => {
    console.warn('Error cleaning up tasks: ', e);
  });

  return undefined;
};

module.exports = exports = Tasks;
