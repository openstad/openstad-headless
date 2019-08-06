const outputUser = (req, res, next) => {
  res.json(req.userObject);
};

exports.all = (req, res, next) => {
  res.json(req.users);
};

exports.show = [
  outputUser
];

exports.create = [
  outputUser
];

exports.update = [
  outputUser
];

exports.delete = [
  (req, res, next) => {
    res.json({'message': 'Deleted!'})
  }
]
