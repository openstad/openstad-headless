const sanitize = require('../util/sanitize');

module.exports = function( db, sequelize, DataTypes ) {
    
    const WidgetType = sequelize.define('widgetTypes', {
        visibleName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        technicalName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });


    WidgetType.auth = WidgetType.prototype.auth = {
        listableBy: 'all',
        viewableBy: 'all',
        createableBy: 'moderator',
        updateableBy: ['moderator', 'owner'],
        deleteableBy: ['moderator', 'owner'],
    }

    return WidgetType;
}
