import { useRouter } from 'next/router';
import useSWR from 'swr';

export function useWidgetConfig() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const swr = useSWR(
    projectId && id
      ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
      : null
  );

  async function updateConfig(config: any) {
    const res = await fetch(
      `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      }
    );
    const data = await res.json();

    swr.mutate(data);
  }

  return { ...swr, updateConfig };
}
