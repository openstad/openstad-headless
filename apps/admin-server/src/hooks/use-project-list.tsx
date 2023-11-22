import useSWR from 'swr';

export default function useProjectList() {
  const projectListSwr = useSWR(`/api/openstad/api/project?includeConfig=1`);

  return { ...projectListSwr };
}
