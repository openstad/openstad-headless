exports.all = (req, res, next) => {
  res.json(req.roles);
}
