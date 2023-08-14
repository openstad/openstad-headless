
var log     = require('debug')('app:cron');
var db      = require('../db');

// Purpose
// -------
// Auto-close ideas that passed the deadline.
// 
// Runs every night at 4:00.
module.exports = {
	cronTime: '0 0 4 * * *',
	runOnInit: true,
	onTick: function() {
		Promise.all([
			db.Vote.anonymizeOldVotes(),
			db.CommentVote.anonymizeOldVotes()
		])
		.then(function([ voteResult, commentVoteResult ]) {
			if( voteResult && voteResult.affectedRows ) {
				log(`anonymized votes: ${voteResult.affectedRows}`);
			}
			if( commentVoteResult && commentVoteResult.affectedRows ) {
				log(`anonymized comment votes: ${commentVoteResult.affectedRows}`);
			}
		});
	}
};
