let renumber = async function ({
  model,
  where = {},
  seqnrFieldName = 'seqnr',
}) {
  // `id` breaks ties deterministically, so rows that share a seqnr keep their
  // creation order instead of depending on whatever order the database returns.
  let instances = await model.findAll({
    where,
    order: [seqnrFieldName, 'id'],
  });

  let nr = 10;
  for (let instance of instances) {
    await instance.update({ [seqnrFieldName]: nr }, { hooks: false });
    nr += 10;
  }
};

module.exports = {
  renumber,
};
