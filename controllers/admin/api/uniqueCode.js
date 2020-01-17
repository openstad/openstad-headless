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
    res.json({'message': 'Success'})
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
