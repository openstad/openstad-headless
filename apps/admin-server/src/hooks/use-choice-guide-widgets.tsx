import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type { ApiWidget } from '@openstad-headless/types';
import useSWR from 'swr';

export default function useChoiceGuideWidgets(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/choicesguide/widgets`;

  const choiceGuidesSwr = useSWR<Pick<ApiWidget, 'id' | 'description'>[]>(
    projectNumber ? url : null
  );

  return { ...choiceGuidesSwr };
}
