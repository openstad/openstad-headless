module.exports = function (db, sequelize, DataTypes) {
  const PendingBudgetVote = sequelize.define(
    'pending_budget_vote',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: 'pending_budget_votes',
      paranoid: false,
      updatedAt: false,
    }
  );

  PendingBudgetVote.auth = PendingBudgetVote.prototype.auth = {
    listableBy: 'none',
    viewableBy: 'none',
    createableBy: 'all',
    updateableBy: 'none',
    deleteableBy: 'all',
  };

  return PendingBudgetVote;
};
