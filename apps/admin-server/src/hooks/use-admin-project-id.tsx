import useSWR from 'swr';

export default function useAdminProjectId(): number | undefined {
  const { data } = useSWR('/api/admin-project-id');
  return data?.adminProjectId;
}
