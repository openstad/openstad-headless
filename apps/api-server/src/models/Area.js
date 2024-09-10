const convertDbPolygonToLatLng = require ('../util/convert-db-polygon-to-lat-lng');
const {formatPolygonToGeoJson} = require('../util/geo-json-formatter');

module.exports = function( db, sequelize, DataTypes ) {
  var Area = sequelize.define('area', {

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    polygon: {
      type: DataTypes.GEOMETRY,
      allowNull: false,
      set: function (featureCollection) {
        if (Array.isArray(featureCollection) && featureCollection.length > 0) {
          const formattedPolygons = featureCollection.map(polygon => {
            return polygon.map(({ lat, lng }) => [lat, lng]);
          });

          const type = formattedPolygons.length > 1 ? 'MultiPolygon' : 'Polygon';

          const formattedGeometry = {
            type: type,
            coordinates: type === 'Polygon' ? [formattedPolygons[0]] : formattedPolygons.map(polygon => [polygon])
          };

          this.setDataValue('polygon', formattedGeometry);
        }
      },
      get: function () {
        return convertDbPolygonToLatLng(this.getDataValue('polygon'));
      }
    },
    /*
    Virtual field would be a nice way to manage the geoJSON version of the data
    geoJSON: {
      type: DataTypes.VIRTUAL,
      get: function () {
        return formatPolygonToGeoJson(this.getDataValue('polygon'))
      }
    },
    */
  });

  Area.associate = function( models ) {
    this.hasMany(models.Project);
  }

  Area.auth = Area.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: ['admin', 'editor'],
    updateableBy: ['admin', 'editor'],
    deleteableBy: ['admin', 'editor'],
    toAuthorizedJSON: function(user, data) {
      data.geoJSON = formatPolygonToGeoJson(data.polygon);
      return data;
    }
  }


  return Area;
}
