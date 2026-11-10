import type { ApiTemplate, DynamicJson } from '@openstad-headless/types';
import useSWR from 'swr';

export type { ApiTemplate as ProjectTemplate } from '@openstad-headless/types';

export default function useTemplates() {
  const url = '/api/openstad/api/template';

  const templatesSwr = useSWR<ApiTemplate[]>(url);

  async function createTemplate(
    name: string,
    data: DynamicJson
  ): Promise<ApiTemplate> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, data }),
    });

    if (!res.ok) {
      throw new Error('Kon de template niet opslaan');
    }

    const template = await res.json();
    templatesSwr.mutate();
    return template;
  }

  async function createTemplateFromProject(
    name: string,
    sourceProjectId: number | string
  ): Promise<ApiTemplate> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, sourceProjectId }),
    });

    if (!res.ok) {
      throw new Error('Kon de template niet opslaan');
    }

    const template = await res.json();
    templatesSwr.mutate();
    return template;
  }

  async function renameTemplate(
    id: number,
    name: string
  ): Promise<ApiTemplate> {
    const res = await fetch(`${url}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error('Kon de template niet hernoemen');
    }

    const template = await res.json();
    templatesSwr.mutate();
    return template;
  }

  async function removeTemplate(id: number) {
    const res = await fetch(`${url}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Kon de template niet verwijderen');
    }

    templatesSwr.mutate();
  }

  return {
    ...templatesSwr,
    createTemplate,
    createTemplateFromProject,
    renameTemplate,
    removeTemplate,
  };
}
