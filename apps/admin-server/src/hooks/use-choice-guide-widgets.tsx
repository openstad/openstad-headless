import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useChoiceGuideWidgets(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/choicesguide/widgets`;

  const choiceGuidesSwr = useSWR(projectNumber ? url : null);

  return { ...choiceGuidesSwr };
}
