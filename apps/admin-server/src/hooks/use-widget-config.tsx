import { validateProjectNumber } from '@/lib/validateProjectNumber';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export function useWidgetConfig<R>(idOverride?: string) {
  const router = useRouter();
  let id = idOverride ?? router.query.id;
  let projectId = router.query.project;

  let projectNumber: number | undefined = validateProjectNumber(projectId);
  let useId: number | undefined = validateProjectNumber(id);

  const swr = useSWR(
    projectNumber && useId
      ? `/api/openstad/api/project/${projectNumber}/widgets/${useId}?includeType=1`
      : null
  );

  // Returns the saved widget (the server response, truthy) on success and null
  // on failure, so callers can show truthful feedback AND reconcile their draft
  // from what the server actually stored. Legacy per-tab save buttons still get
  // a toast; the whole-widget save bar passes { silent: true } and renders its
  // own success/error state (avoiding double feedback and the "always success"
  // toast bug).
  async function updateConfig<R extends { [key: string]: any }>(
    config: R,
    options?: { silent?: boolean }
  ): Promise<{ config: R } | null> {
    const silent = options?.silent ?? false;

    // these are added by the preview but should not be saved
    if (config.login?.url) delete config.login?.url;
    if (config.logout?.url) delete config.logout?.url;

    try {
      const res = await fetch(
        `/api/openstad/api/project/${projectNumber}/widgets/${useId}?includeType=1`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config }),
        }
      );

      if (!res.ok) {
        if (!silent) toast.error('De configuratie kon niet worden aangepast');
        return null;
      }

      const data = await res.json();
      swr.mutate(data);
      if (!silent) toast.success('Configuratie aangepast');
      return data;
    } catch (error) {
      if (!silent) toast.error('De configuratie kon niet worden aangepast');
      return null;
    }
  }

  return { ...swr, data: swr.data as { config: R }, updateConfig };
}
