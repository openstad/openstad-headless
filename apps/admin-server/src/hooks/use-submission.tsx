import useSWR from 'swr';

export default function useSubmissions(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/submission`;

  const submissionListSwr = useSWR(projectId ? url : null);

  return {...submissionListSwr}
}