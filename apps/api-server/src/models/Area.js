const convertDbPolygonToLatLng = require ('../util/convert-db-polygon-to-lat-lng');
const {formatPolygonToGeoJson} = require('../util/geo-json-formatter');

module.exports = function( db, sequelize, DataTypes ) {
  var Area = sequelize.define('area', {

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    hidePolygon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    polygon: {
      type: DataTypes.GEOMETRY,
      allowNull: false,
      set: function (featureCollection) {
        if (Array.isArray(featureCollection) && featureCollection.length > 0) {
          // Detect ring structure: [[{lat,lng},...], ...] vs [{lat,lng}, ...]
          // New structure from formatGeoJsonToPolygon has nested rings per polygon
          const firstPolygon = featureCollection[0];
          const hasRingStructure = Array.isArray(firstPolygon) &&
                                   Array.isArray(firstPolygon[0]) &&
                                   firstPolygon[0][0]?.lat !== undefined;

          let formattedPolygons;
          if (hasRingStructure) {
            // New structure: array of polygons, each polygon is array of rings
            // e.g., [[[{lat,lng},...], [{lat,lng},...]], ...] (polygon with holes)
            formattedPolygons = featureCollection.map(polygon =>
              polygon.map(ring => ring.map(({ lat, lng }) => [lat, lng]))
            );
          } else {
            // Legacy structure: array of flat polygons (no holes support)
            // e.g., [[{lat,lng},...], [{lat,lng},...]]
            formattedPolygons = featureCollection.map(polygon =>
              [polygon.map(({ lat, lng }) => [lat, lng])]
            );
          }

          const type = formattedPolygons.length > 1 ? 'MultiPolygon' : 'Polygon';

          const formattedGeometry = {
            type: type,
            coordinates: type === 'Polygon'
              ? formattedPolygons[0]  // Single polygon: all rings
              : formattedPolygons     // MultiPolygon: array of polygons with rings
          };

          const totalRings = type === 'Polygon'
            ? formattedGeometry.coordinates.length
            : formattedGeometry.coordinates.reduce((sum, p) => sum + p.length, 0);

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
    this.belongsToMany(models.Tag, {
      through: {
        model: models.area_tags,
        scope: { location: 'inside' },
      },
      as: 'tags',
      foreignKey: 'areaId',
      otherKey: 'tagId',
    });
    this.belongsToMany(models.Tag, {
      through: {
        model: models.area_tags,
        scope: { location: 'outside' },
      },
      as: 'outsideTags',
      foreignKey: 'areaId',
      otherKey: 'tagId',
    });
  }

  Area.scopes = function scopes() {
    return {
      includeTags: {
        include: [
          {
            model: db.Tag,
            as: 'tags',
          },
          {
            model: db.Tag,
            as: 'outsideTags',
          },
        ],
      },
    };
  };

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
