var config = require('config');

module.exports = function( db, sequelize, DataTypes ) {
  var CommentVote = sequelize.define('comment_vote', {

    commentId: {
      type         : DataTypes.INTEGER,
      allowNull    : false
    },

    userId: {
      type         : DataTypes.INTEGER,
      allowNull    : false,
      defaultValue: 0,
    },

    ip: {
      type         : DataTypes.STRING(64),
      allowNull    : true,
      validate     : {
        isIP: true
      }
    },

    // This will be true if the vote validation CRON determined this
    // vote is valid.
    checked : {
      type         : DataTypes.BOOLEAN,
      allowNull    : true
    }

  }, {
    indexes: [{
      fields : ['commentId', 'userId'],
      unique : true
    }],

  });

  CommentVote.associate = function( models ) {
    CommentVote.belongsTo(models.Comment, { onDelete: 'CASCADE' });
    CommentVote.belongsTo(models.User, { onDelete: 'CASCADE' });
  }

  CommentVote.prototype.toggle = function() {
    var checked = this.get('checked');
    return this.update({
      checked: checked === null ? false : !checked
    });
  }

  CommentVote.auth = CommentVote.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['editor','owner'],
    deleteableBy: ['editor','owner'],
  }

  return CommentVote;

};
