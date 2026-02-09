import useSWR from 'swr';
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useActions(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/action`;

  const actionListSwr = useSWR(projectNumber ? url : null);

  return {...actionListSwr}
}