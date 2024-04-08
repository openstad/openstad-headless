let renumber = async function({ model, where = {}, seqnrFieldName = 'seqnr' }) {

  let instances = await model.findAll({ where, order: [ seqnrFieldName ] });

  let nr = 10;
  for (let instance of instances) {
    await instance.update({ [seqnrFieldName]: nr }, { hooks: false });
    nr += 10;
  }

}

module.exports = {
  renumber,
};
