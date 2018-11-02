exports.all = () => {
  res.render('client/all');
}

exports.newForm = () => {
  res.render('client/new');
}

exports.editForm = () => {
  res.render('client/edit');
}

exports.create = () => {
  new Client({

    })
    .save()
    .then();
}

exports.post = () => {

}
