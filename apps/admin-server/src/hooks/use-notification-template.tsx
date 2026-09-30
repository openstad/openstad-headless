import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useNotificationTemplate(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  let url = `/api/openstad/notification/project/${projectNumber}/template`;

  const notificationTemplateSwr = useSWR(projectNumber ? url : null);

  // The list can still be loading while a form is saved, so the cache update
  // must not spread `undefined`.
  const currentTemplates = () =>
    Array.isArray(notificationTemplateSwr.data)
      ? notificationTemplateSwr.data
      : [];

  async function create(
    projectId: string,
    engine: string,
    type: string,
    label: string,
    subject: string,
    body: string
  ) {
    const projectNumber: number | undefined = validateProjectNumber(projectId);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectNumber,
        engine: engine,
        type: type,
        label: label,
        subject: subject,
        body: body,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      notificationTemplateSwr.mutate([...currentTemplates(), data]);
      return data;
    } else {
      throw new Error('Could not create the template');
    }
  }

  async function update(
    id: string,
    label: string,
    subject: string,
    body: string
  ) {
    let url = `/api/openstad/notification/project/${projectNumber}/template/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        label: label,
        subject: subject,
        body: body,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      // Replace the stored template instead of appending it: the page groups
      // the list by type, so a second entry for the same id would render a
      // duplicate form right after the save.
      const templates = currentTemplates();
      const index = templates.findIndex(
        (template: any) => String(template?.id) === String(data?.id)
      );
      notificationTemplateSwr.mutate(
        index === -1
          ? [...templates, data]
          : templates.map((template: any, i: number) =>
              i === index ? data : template
            )
      );
      return data;
    } else {
      throw new Error('Could not edit the template');
    }
  }

  return { ...notificationTemplateSwr, create, update };
}
