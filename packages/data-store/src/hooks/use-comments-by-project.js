export default function useCommentsByProject(props) {

  let self = this;
  
  const projectId = props.projectId;
  const sentiment = props.sentiment;
  
  const { data, error, isLoading } = self.useSWR({ projectId, sentiment }, 'commentsByProject.fetch');
  
  let comments = data || [];
  
  if (error) {
    let error = new Error(error);
    let event = new window.CustomEvent('osc-error', { detail: error });
    document.dispatchEvent(event);
  }
  
  return [ comments, error, isLoading ]
}