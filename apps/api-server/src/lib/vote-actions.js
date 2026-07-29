// Builds the create/update/delete actions for voteType 'likes'.
// Likes are a per-resource toggle: votes on other resources are never affected.
function buildLikeActions(votes, existingVotes) {
  const actions = [];
  votes.forEach((vote) => {
    const existingVote = existingVotes.find(
      (entry) => entry.resourceId == vote.resourceId
    );
    if (existingVote) {
      if (existingVote.opinion == vote.opinion) {
        actions.push({ action: 'delete', vote: existingVote });
      } else {
        existingVote.opinion = vote.opinion;
        actions.push({ action: 'update', vote: existingVote });
      }
    } else {
      actions.push({ action: 'create', vote: vote });
    }
  });
  return actions;
}

module.exports = { buildLikeActions };
