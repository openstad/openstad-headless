const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('area_tags', {
      areaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'inside',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });

    const [[primaryKeyResult]] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count
       FROM information_schema.table_constraints
       WHERE table_schema = DATABASE()
         AND table_name = 'area_tags'
         AND constraint_type = 'PRIMARY KEY'`
    );
    const hasPrimaryKey = Number(primaryKeyResult?.count || 0) > 0;

    if (!hasPrimaryKey) {
      await queryInterface.addConstraint('area_tags', {
        fields: ['areaId', 'tagId', 'location'],
        type: 'primary key',
        name: 'area_tags_pkey',
      });
    }

    await queryInterface.addConstraint('area_tags', {
      fields: ['areaId'],
      type: 'foreign key',
      name: 'area_tags_areaId_fkey',
      references: {
        table: 'areas',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('area_tags', {
      fields: ['tagId'],
      type: 'foreign key',
      name: 'area_tags_tagId_fkey',
      references: {
        table: 'tags',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('area_tags');
  },
};
