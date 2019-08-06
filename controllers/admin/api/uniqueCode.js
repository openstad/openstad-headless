const outputUniqueCode = (req, res, next) => {
  res.json(req.uniqueCode);
};

exports.all = (req, res, next) => {
  res.json(req.codes);
};

exports.show = [
  outputUniqueCode
];

exports.create = [
  outputUniqueCode
];

exports.update = [
  outputUniqueCode
];

exports.delete = [
  (req, res, next) => {
    res.json({'message': 'Deleted!'})
  }
];
