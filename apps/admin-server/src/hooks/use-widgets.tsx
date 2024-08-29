import { WidgetDefinition } from '@/lib/widget-definitions';
import useSWR from 'swr';

export function useWidgetsHook(projectId?: string) {
  let url = `/api/openstad/api/project/${projectId}/widgets`;

  const widgetsSwr = useSWR(projectId ? url : null);

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

  async function remove(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/widgets/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const updateUrl = `/api/openstad/api/project/${projectId}/widgets/${id}`;

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

      console.log({new: widgetsSwr.data});
      return widgetsSwr.data;

    } else {
      throw new Error('Could not update the widget');
    }

  }


  return { ...widgetsSwr, createWidget, updateWidget, remove };
}

export type Widget = {
  id: number;
  projectId: number;
  description: string;

  config: object;
  type: WidgetDefinition;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
