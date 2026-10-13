import { resetWidgetPreview } from '@/hooks/useWidgetPreview';
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
  restoredFromId: number | null;
  createdAt: string;
};

type RestoreResult = { ok: boolean; undoVersionId: number | null };

export async function restoreWidgetVersion({
  url,
  mutateVersions,
  mutateWidget,
  resetPreview,
  fetcher = fetch,
}: {
  url: string;
  mutateVersions: () => Promise<unknown>;
  mutateWidget: () => Promise<unknown>;
  resetPreview: () => void;
  fetcher?: typeof fetch;
}): Promise<RestoreResult> {
  const failed = { ok: false, undoVersionId: null };

  try {
    const res = await fetcher(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      toast.error('De versie kon niet worden hersteld');
      return failed;
    }

    const data = await res.json();
    await mutateVersions();
    await mutateWidget();
    resetPreview();
    return { ok: true, undoVersionId: data?.undoVersionId ?? null };
  } catch (error) {
    toast.error('De versie kon niet worden hersteld');
    return failed;
  }
}

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

    try {
      const res = await fetch(
        `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}/versions/${versionId}`
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data?.config ?? null;
    } catch (error) {
      return null;
    }
  }

  async function restore(versionId: number): Promise<RestoreResult> {
    if (!projectNumber || !widgetNumber)
      return { ok: false, undoVersionId: null };

    const widgetUrl = `/api/openstad/api/project/${projectNumber}/widgets/${widgetNumber}`;
    return restoreWidgetVersion({
      url: `${widgetUrl}/versions/${versionId}/restore`,
      mutateVersions: () => swr.mutate(),
      mutateWidget: () => globalMutate(`${widgetUrl}?includeType=1`),
      resetPreview: () => resetWidgetPreview(widgetNumber),
    });
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
