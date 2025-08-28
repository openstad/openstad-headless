import { WidgetDefinition } from '@/lib/widget-definitions';
import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

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

      console.log({new: widgetsSwr.data});
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


  return { ...widgetsSwr, createWidget, updateWidget, remove, duplicate };
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
