import useSWR from 'swr';

export type ProjectTemplate = {
  id: number;
  name: string;
  data: any;
  createdAt: string;
  updatedAt: string;
};

export default function useTemplates() {
  const url = '/api/openstad/api/template';

  const templatesSwr = useSWR(url);

  async function createTemplate(name: string, data: any) {
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

  async function renameTemplate(id: number, name: string) {
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

  return { ...templatesSwr, createTemplate, renameTemplate, removeTemplate };
}
