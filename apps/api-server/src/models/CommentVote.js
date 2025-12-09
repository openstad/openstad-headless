var config = require('config');

const updateCommentScore = async (vote, options) => {
  try {
    const run = async () => {
      const comment = await vote.getComment();
      if (comment && typeof comment.calculateAndSaveScore === 'function') {
        await comment.calculateAndSaveScore();
      }
    };

    // If create ran inside a transaction, wait for commit so other queries see the new row
    if (options && options.transaction && options.transaction.afterCommit) {
      options.transaction.afterCommit(() => {
        run().catch((err) =>
          console.error('Failed to recalculate comment score after transaction commit:', err)
        );
      });
    } else {
      await run();
    }
  } catch (err) {
    console.error('Update comment score failed in hook for CommentVote:', err);
  }
}

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

    opinion: {
      type         : DataTypes.STRING(64),
      allowNull    : false,
      defaultValue : "yes"
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
    hooks: {
      afterCreate: async (vote, options) => {
        await updateCommentScore(vote, options);
      },

      afterUpdate: async function (vote, options) {
        await updateCommentScore(vote, options);
      },
      
      afterDestroy: async function (vote, options) {
        await updateCommentScore(vote, options);
      },
      
      afterUpsert: async function (vote, options) {
        await updateCommentScore(vote, options);
      }
      
    },
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
