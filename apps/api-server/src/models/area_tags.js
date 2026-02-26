module.exports = function (db, sequelize, DataTypes) {
  const AreaTags = sequelize.define(
    'area_tags',
    {
      areaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'inside',
        primaryKey: true,
      },
    },
    {
      tableName: 'area_tags',
      timestamps: true,
      paranoid: false,
    }
  );

  return AreaTags;
};
