import useSWR from 'swr';

export default function useNotificationTemplate(projectId?: string, type?: string) {
  let url = `/api/openstad/notification/project/${projectId}/template`;

  const notificationTemplateSwr = useSWR(projectId ? url : null);

  async function create(projectId: string, engine: string, type: string, label: string, subject: string, body: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        projectId: projectId,
        engine: engine,
        type: type,
        label: label,
        subject: subject,
        body: body
       }),
    });

    if (res.ok) {
      const data = await res.json();
      notificationTemplateSwr.mutate([...notificationTemplateSwr.data, data]);
      return data;
    } else {
      throw new Error('Could not create the template');
    }
  }
  
  async function update(id: string, label: string, subject: string, body: string, engine?: string) {
    let url = `/api/openstad/notification/project/${projectId}/template/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        engine: engine,
        label: label,
        subject: subject,
        body: body
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
