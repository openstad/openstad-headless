const outputClient = (req, res, next) => {
  res.json(req.client);
}

exports.all = (req, res, next) => {
  res.json(req.clients);
}

exports.show = [
  outputClient
]

exports.create = [
  outputClient
]

exports.update = [
  outputClient
]

exports.delete = [
  outputClient
]
