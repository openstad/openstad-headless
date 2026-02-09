import useSWR from 'swr';
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useResource(projectId?: string, id?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const useId: number | undefined = validateProjectNumber(id);

  const url = `/api/openstad/api/project/${projectNumber}/resource/${useId}?includeUserVote=1&includeTags=1`;

  const resourceSwr = useSWR(projectNumber && useId ? url : null);

  return { ...resourceSwr };
}
