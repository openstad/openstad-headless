const { Op } = require('sequelize');

function hideIncompleteMembersClause() {
  return {
    [Op.or]: [
      { role: { [Op.ne]: 'member' } },
      { name: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } },
      { email: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } },
    ],
  };
}

module.exports = { hideIncompleteMembersClause };
