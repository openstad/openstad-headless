export default function useProjectVotedUsersCount({ projectId }) {
  let self = this;

  if (!projectId) {
    return { data: 0, error: 'No projectId given', isLoading: false };
  }

  try {
    const { data, error, isLoading } = self.useSWR(
      { projectId },
      'projectVotedUsersCount.fetch'
    );

    if (error) {
      let newError = new Error(error);
      let event = new window.CustomEvent('osc-error', { detail: newError });
      document.dispatchEvent(event);
    }

    return { data: data?.count || 0, error, isLoading };
  } catch (e) {
    return {
      data: 0,
      error:
        'Er ging iets mis bij het ophalen van het aantal gebruikers dat heeft gestemd',
      isLoading: false,
    };
  }
}
