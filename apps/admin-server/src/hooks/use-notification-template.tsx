import type { NotificationContent } from '@/lib/notification-content';
import {
  NotificationScope,
  inheritedGlobalTemplatesUrl,
  notificationTemplateBaseUrl,
  toNotificationScope,
} from '@/lib/notification-scope';
import { useMemo } from 'react';
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

/**
 * What "Herstel standaard" falls back to, in the same order as the server resolves a mail:
 * the global template for that type first, then the template shipped with OpenStad. In
 * global scope there is nothing above the shipped ones.
 */
export function useNotificationTemplateDefaults(
  scopeOrProjectId?: NotificationScope | string
) {
  const scope = toNotificationScope(scopeOrProjectId);
  const baseUrl = notificationTemplateBaseUrl(scope);
  const globalUrl = inheritedGlobalTemplatesUrl(scope);

  const shippedSwr = useSWR<NotificationTemplateDefault[]>(
    baseUrl ? `${baseUrl}/defaults` : null
  );
  const globalSwr = useSWR<NotificationTemplateDefault[]>(globalUrl);

  // Memoised on the two responses: a fresh array every render would give every consumer a
  // new `defaultTemplate` identity, and the form's reset effect would loop on it.
  const data = useMemo(() => {
    if (!shippedSwr.data) return shippedSwr.data;

    const shipped = Array.isArray(shippedSwr.data) ? shippedSwr.data : [];
    const global = Array.isArray(globalSwr.data) ? globalSwr.data : [];

    // A global template without a body is not a usable default; fall through to the
    // shipped one instead of offering an empty restore.
    return shipped.map((template) => {
      const override = global.find(
        (candidate) => candidate.type === template.type && candidate.body
      );
      return override ? { ...template, ...override } : template;
    });
  }, [shippedSwr.data, globalSwr.data]);

  return {
    ...shippedSwr,
    data,
  };
}

export default function useNotificationTemplate(
  scopeOrProjectId?: NotificationScope | string
) {
  const scope = toNotificationScope(scopeOrProjectId);
  const url = notificationTemplateBaseUrl(scope);

  const notificationTemplateSwr = useSWR(url);

  // No projectId argument: the route derives it in project scope and there is none in
  // global scope, so passing one could only contradict the url.
  async function create({
    engine,
    type,
    label,
    subject,
    body,
    content = null,
  }: {
    engine: string;
    type: string;
    label: string;
    subject: string;
    body: string;
    content?: NotificationContent | null;
  }) {
    if (!url) throw new Error('Could not create the template');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
    if (!url) throw new Error('Could not edit the template');

    const res = await fetch(`${url}/${id}`, {
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
