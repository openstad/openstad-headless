export default function useUserVote(props) {
  let self = this;

  const projectId = props.projectId;
  const type = props.type;

  if (!projectId) {
    return { data: {}, error: 'No projectId given', isLoading: false };
  }

  const { data, error, isLoading } = self.useSWR(
    { type, projectId: self.projectId },
    'userVote.fetch'
  );

  // add functionality
  let userVote = data || {};
  userVote.submitVote = function (vote) {
    return self.mutate(
      { type: 'user-vote', projectId: self.projectId },
      'userVote.submitVote',
      vote,
      { action: 'update' }
    );
  };

  if (error) {
    let error = new Error(error);
    let event = new window.CustomEvent('osc-error', { detail: error });
    document.dispatchEvent(event);
  }

  return { data: userVote, error, isLoading };
}
