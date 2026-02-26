import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useNotificationTemplate(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  let url = `/api/openstad/notification/project/${projectNumber}/template`;

  const notificationTemplateSwr = useSWR(projectNumber ? url : null);

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
      console.log(data);
      notificationTemplateSwr.mutate([...notificationTemplateSwr.data, data]);
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
      notificationTemplateSwr.mutate([...notificationTemplateSwr.data, data]);
      return data;
    } else {
      throw new Error('Could not edit the template');
    }
  }

  return { ...notificationTemplateSwr, create, update };
}
