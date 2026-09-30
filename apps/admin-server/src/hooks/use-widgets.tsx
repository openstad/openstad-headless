import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export function useWidgetsHook(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  let url = `/api/openstad/api/project/${projectNumber}/widgets`;

  const widgetsSwr = useSWR(projectNumber ? url : null);

  async function createWidget(typeId: string, description: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: typeId, description }),
    });
    const data = await res.json();
    widgetsSwr.mutate([...widgetsSwr.data, data]);
    return data;
  }

  async function remove(id: number, multiple?: boolean, ids?: number[]) {
    const deleteUrl = multiple
      ? `/api/openstad/api/project/${projectNumber}/widgets/delete`
      : `/api/openstad/api/project/${projectNumber}/widgets/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: multiple ? JSON.stringify({ ids }) : undefined,
    });

    if (res.ok) {
      const existingData = [...widgetsSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      widgetsSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove the widget');
    }
  }

  async function updateWidget(id: number, body: any) {
    const updateUrl = `/api/openstad/api/project/${projectNumber}/widgets/${id}`;

    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const existingData = [...widgetsSwr.data];
      const updatedList = existingData.filter((ed) => ed.id === id);

      updatedList[0].description = body.description;
      widgetsSwr.mutate(updatedList);

      console.log({ new: widgetsSwr.data });
      return widgetsSwr.data;
    } else {
      throw new Error('Could not update the widget');
    }
  }

  async function duplicate(ids: number[]) {
    const duplicateUrl = `/api/openstad/api/project/${projectNumber}/widgets/duplicate`;

    const res = await fetch(duplicateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (res.ok) {
      const data = await res.json();

      widgetsSwr.mutate([...widgetsSwr.data, ...data]);
      return data;
    } else {
      throw new Error('Could not duplicate the widgets');
    }
  }

  async function copyWidgets(sourceProjectId: number, ids: number[]) {
    const copyUrl = `/api/openstad/api/project/${projectNumber}/widgets/copy`;

    const res = await fetch(copyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceProjectId, ids }),
    });

    if (res.ok) {
      const data = await res.json();

      // The list may still be loading (or have failed to load) when the copy
      // returns; appending to a non-array would throw *after* the widgets were
      // already created server-side, and report a success as a failure.
      widgetsSwr.mutate((current: any) =>
        Array.isArray(current) ? [...current, ...data] : data
      );
      return data;
    } else {
      const body = await res.json().catch(() => null);
      // Carry the status so the caller can phrase its own message; the API's
      // messages are English and the admin interface is Dutch.
      const error: Error & { status?: number } = new Error(
        body?.message || 'Could not copy the widgets'
      );
      error.status = res.status;
      throw error;
    }
  }

  return {
    ...widgetsSwr,
    createWidget,
    updateWidget,
    remove,
    duplicate,
    copyWidgets,
  };
}

export type Widget = {
  id: number;
  projectId: number;
  description: string;

  config: object;
  type: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
