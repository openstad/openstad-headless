'use strict';

const jwt = require('jsonwebtoken');
const merge = require('merge');

let Tasks = {};

/**
 * Task data is stored in memory only
 * Purpose is only to be able to send information about background tasks. 
 * Currently the only available task is the creation of unique tokens
 *
 * The structure of this file is similar to tat of other files here; I think it should work as an object instead of this but then maybe so should the rest
 */

/**
 * Tasks in-memory data structure
 */
let tasks = Object.create(null);

/**
 * Returns a task if it finds one, otherwise returns null if one is not found.
 * @param   {String}  taskId - The task to find.
 * @returns {Promise} resolved with the task
 */
Tasks.find = (taskId) => {
  try {
    Tasks.cleanUp();
    return Promise.resolve(tasks[taskId]);
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Update or create a task
 * @param   {Object}  taskId   - The taskId (required)
 * @param   {String}  data - The data to be stored
 */
Tasks.save = (taskId, newData) => {
  taskId = taskId || parseInt(Math.random() * 10000000) + 10000000;
  let oldData = tasks[taskId] || {};
  tasks[taskId] = merge.recursive(oldData, newData, {taskId, lastUpdateDate: Date.now()});
  return Promise.resolve(tasks[taskId]);
};

/**
 * Deletes a task
 * @param   {String}  taskId - The id of the task to delete.
 * @returns {Promise} resolved with the deleted task
 */
Tasks.delete = (taskId) => {
  try {
    const deletedTask = tasks[taskId];
    delete tasks[taskId];
    return Promise.resolve(deletedTask);
  } catch (error) {
    return Promise.resolve(undefined);
  }
};

/**
 * Removes all tasks.
 * @returns {Promise} resolved with all removed tasks returned
 */
Tasks.removeAll = () => {
  const deletedTasks = tasks;
  tasks = Object.create(null);
  return Promise.resolve(deletedTasks);
};

/**
 * Removes old tasks.
 * @returns {Promise} resolved with undef
 */
Tasks.cleanUp = async () => {
  let maxTaskAge = 60 * 60 * 1000; // milliseconds // TODO: configurable
  for (let taskId of Object.keys(tasks)) {
    let task = tasks[taskId];
    if (Date.now() - task.lastUpdateDate > maxTaskAge) {
      await Tasks.delete(taskId);
    }
  }
  return Promise.resolve(undefined);
};


module.exports = exports = Tasks;
