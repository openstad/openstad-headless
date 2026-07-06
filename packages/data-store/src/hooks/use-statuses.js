export default function useStatuses(props) {
  let self = this;
  const projectId = props.projectId;

  const { data, error, isLoading } = self.useSWR(
    { projectId: projectId || self.projectId },
    'statuses.fetch'
  );

  let statuses = data || [];

  if (error) {
    let event = new window.CustomEvent('osc-error', {
      detail: new Error(error),
    });
    document.dispatchEvent(event);
  }

  return { data: statuses, error, isLoading };
}
