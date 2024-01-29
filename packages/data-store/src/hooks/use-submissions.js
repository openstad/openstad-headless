export default function useSubmissions(props) {

  let self = this;

  const projectId = props.projectId;

  const { data, error, isLoading } = self.useSWR({ projectId }, 'submissions.fetch');

  let submissions = data || [];

  if (error) {
    let error = new Error(error);
    let event = new window.CustomEvent('osc-error', { detail: error });
    document.dispatchEvent(event);
  }

  return [ submissions, error, isLoading ]
}