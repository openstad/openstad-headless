import useSWR from 'swr';

export default function useChoiceGuides(projectId?: string) {
  if (projectId && (!/^\d+$/.test(projectId.toString()))) {
    projectId = undefined;
  }

  const url = `/api/openstad/api/project/${projectId}/choicesguide/`;

  const choiceGuidesSwr = useSWR(projectId ? url : null);

  return {...choiceGuidesSwr}
}