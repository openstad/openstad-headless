const sanitize = require('../util/sanitize');

module.exports = function( db, sequelize, DataTypes ) {
    
    const Widget = sequelize.define('widgets', {
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        config: {
            type: DataTypes.JSON,
            default: {},
            allowNull: false
        }
    });

    Widget.associate = function (models) {
        this.belongsTo(models.Project, {
            foreignKey: {
                allowNull: false
            },
            onDelete: 'cascade',
        });
    }

    Widget.auth = Widget.prototype.auth = {
        listableBy: 'all',
        viewableBy: 'all',
        createableBy: 'moderator',
        updateableBy: ['moderator', 'owner'],
        deleteableBy: ['moderator', 'owner'],
      }


    Widget.scopes = function scopes() {
        return {};
    }
    return Widget;
}
