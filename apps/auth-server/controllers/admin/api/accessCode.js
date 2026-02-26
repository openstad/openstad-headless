const outputAccessCode = (req, res, next) => {
  res.json(req.code);
};

exports.all = (req, res, next) => {
  res.json({
    total: req.totalCodeCount,
    data: req.codes,
  });
};

exports.created = [
  (req, res, next) => {
    res.json({ message: 'Success' });
  },
];

exports.delete = [
  (req, res, next) => {
    res.json({ message: 'Deleted!' });
  },
];
