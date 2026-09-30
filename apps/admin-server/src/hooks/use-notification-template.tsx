import type { NotificationContent } from '@/lib/notification-content';
import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export type NotificationTemplateDefault = {
  type: string;
  label: string;
  subject: string;
  body: string;
  content: NotificationContent | null;
};

/**
 * Replace the template with the same id, or append it when it is new. Plain
 * appending duplicated the row after every save.
 */
function upsertTemplate(list: any, template: any) {
  const templates = Array.isArray(list) ? list : [];
  const exists = templates.some((item) => item.id === template.id);
  return exists
    ? templates.map((item) => (item.id === template.id ? template : item))
    : [...templates, template];
}

export function useNotificationTemplateDefaults(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/notification/project/${projectNumber}/template/defaults`;

  return useSWR<NotificationTemplateDefault[]>(projectNumber ? url : null);
}

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
    body: string,
    content: NotificationContent | null = null
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
        content: content,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      notificationTemplateSwr.mutate(
        upsertTemplate(notificationTemplateSwr.data, data)
      );
      return data;
    } else {
      throw new Error('Could not create the template');
    }
  }

  async function update(
    id: string,
    label: string,
    subject: string,
    body: string,
    content: NotificationContent | null = null
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
        content: content,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      notificationTemplateSwr.mutate(
        upsertTemplate(notificationTemplateSwr.data, data)
      );
      return data;
    } else {
      throw new Error('Could not edit the template');
    }
  }

  return { ...notificationTemplateSwr, create, update };
}
