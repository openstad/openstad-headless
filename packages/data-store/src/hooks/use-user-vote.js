import { useState } from 'react';

export default function useUserVote(props) {

  let self = this;

  const projectId = props.projectId || props.config.projectId;
  const type = props.type || props.config.type;

  const { data, error, isLoading } = self.useSWR({ type: 'user-vote', projectId: self.projectId }, 'userVote.fetch');

  // add functionality
  let userVote = data || {};
  userVote.submitVote = function(vote) {
    return self.mutate({ type: 'user-vote', projectId: self.projectId }, 'userVote.submitVote', vote, { action: 'update' });
  }

  if (error) {
    let error = new Error(error);
	  let event = new window.CustomEvent('osc-error', { detail: error });
	  document.dispatchEvent(event);
  }

  return [ userVote, error, isLoading ];

}

