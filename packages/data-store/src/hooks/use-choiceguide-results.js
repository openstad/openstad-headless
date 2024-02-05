export default function useChoiceGuideResults(props) {

    let self = this;
    
    const projectId = props.projectId;
    const choiceGuideId = props.choiceGuideId;

    if(!choiceGuideId) {
      return {data: [], error: "No choiceGuideId given", isLoading:false }
    }
    
    const { data, error, isLoading } = self.useSWR({ projectId, choiceGuideId }, 'choiceGuideResults.fetch');
        
    if (error) {
      let error = new Error(error);
      let event = new window.CustomEvent('osc-error', { detail: error });
      document.dispatchEvent(event);
    }
    
    return {data: data || [], error, isLoading }
  }