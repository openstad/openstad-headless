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

  return { ...widgetsSwr, createWidget };
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
