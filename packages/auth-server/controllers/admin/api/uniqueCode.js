const Tasks = require('../../../memoryStorage/tasks');

const outputUniqueCode = (req, res, next) => {
  res.json(req.code);
};

exports.all = (req, res, next) => {
  res.json({
    total: req.totalCodeCount,
    data: req.codes
  });
};

exports.show = [
  outputUniqueCode
];

exports.created = [
  (req, res, next) => {
    let taskId = req.taskId;
    res.json({'message': 'Success', taskId})
  }
];

exports.generatorStatus = [
  async (req, res, next) => {
    let taskId = req.query.taskId;
    if (taskId) {
      let task = await Tasks.find(taskId)
      if (task) return res.json(task);
    }
    res.json({'message': 'Generator not found'})
  }
];

exports.update = [
  outputUniqueCode
];

exports.reset = [
  outputUniqueCode
];

exports.delete = [
  (req, res, next) => {
    res.json({'message': 'Deleted!'})
  }
];
