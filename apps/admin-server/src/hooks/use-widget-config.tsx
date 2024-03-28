import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export function useWidgetConfig<R>() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const swr = useSWR(
    projectId && id
      ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
      : null
  );

  async function updateConfig<R extends {[key:string]:any}>(config: R) {

    // these are added by the preview but should not be saved
    if (config.login?.url) delete config.login?.url;
    if (config.logout?.url) delete config.logout?.url;

    try {
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

      if (!res.ok) {
        toast.error('De configuratie kon niet worden aangepast');
      } else {
        const data = await res.json();
        swr.mutate(data);
      }
      toast.success('Configuratie aangepast');
    } catch (error) {
      toast.error('De configuratie kon niet worden aangepast');
    }
  }

  return { ...swr, data: swr.data as {config: R}, updateConfig };
}
