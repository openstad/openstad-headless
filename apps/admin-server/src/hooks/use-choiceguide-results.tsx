import useSWR from 'swr';

export default function useChoiceGuideResults(projectId: string, choiceGuideId: string) {
  const url = `/api/openstad/api/project/${projectId}/choicesguide/${choiceGuideId}/result`;

  const choiceGuideResultListSwr = useSWR(projectId && choiceGuideId ? url : null);

  return {...choiceGuideResultListSwr}
}