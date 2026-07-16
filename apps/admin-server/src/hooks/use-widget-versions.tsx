import { validateProjectNumber } from '@/lib/validateProjectNumber';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate as globalMutate } from 'swr';

export type WidgetVersion = {
  id: number;
  widgetId: number;
  projectId: number;
  userId: number | null;
  userName: string | null;
  name: string | null;
  pinned: boolean;
  createdAt: string;
};

export function useWidgetVersions(
  widgetId?: string | number,
  projectId?: string | number
) {
  const projectNumber = validateProjectNumber(
    projectId != null ? String(projectId) : undefined
  );
  const widgetNumber = validateProjectNumber(
    widgetId != null ? String(widgetId) : undefined
  );

  const versionsUrl =
    projectNumber && widgetNumber
      ? `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}/versions`
      : null;

  const swr = useSWR<WidgetVersion[]>(versionsUrl);

  const data = useMemo(
    () =>
      swr.data
        ? swr.data.map((version) => ({
            ...version,
            pinned: !!version.pinned,
          }))
        : swr.data,
    [swr.data]
  );

  async function getVersionConfig(versionId: number) {
    if (!projectNumber || !widgetNumber) return null;

    const res = await fetch(
      `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}/versions/${versionId}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data?.config ?? null;
  }

  async function restore(versionId: number): Promise<number | null> {
    if (!projectNumber || !widgetNumber) return null;

    try {
      const res = await fetch(
        `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}/versions/${versionId}/restore`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!res.ok) {
        toast.error('De versie kon niet worden hersteld');
        return null;
      }

      const data = await res.json();
      await swr.mutate();
      await globalMutate(
        `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}?includeType=1`
      );
      return data?.undoVersionId ?? null;
    } catch (error) {
      toast.error('De versie kon niet worden hersteld');
      return null;
    }
  }

  async function updateVersion(
    versionId: number,
    updates: { name?: string | null; pinned?: boolean }
  ): Promise<boolean> {
    if (!projectNumber || !widgetNumber) return false;

    try {
      const res = await fetch(
        `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}/versions/${versionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }
      );

      if (!res.ok) {
        toast.error('De versie kon niet worden bijgewerkt');
        return false;
      }

      await swr.mutate();
      return true;
    } catch (error) {
      toast.error('De versie kon niet worden bijgewerkt');
      return false;
    }
  }

  return {
    data,
    error: swr.error,
    isLoading: !swr.data && !swr.error,
    mutate: swr.mutate,
    restore,
    updateVersion,
    getVersionConfig,
  };
}
