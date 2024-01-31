import useSWR from 'swr';

export default function useChoiceGuides(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/choicesguide/`;

  const choiceGuidesSwr = useSWR(projectId ? url : null);

  return {...choiceGuidesSwr}
}