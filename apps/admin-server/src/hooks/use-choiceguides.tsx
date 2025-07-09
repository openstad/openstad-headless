import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export default function useChoiceGuides(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/choicesguide/widgets`;

  const choiceGuidesSwr = useSWR(projectNumber ? url : null);

  return {...choiceGuidesSwr}
}