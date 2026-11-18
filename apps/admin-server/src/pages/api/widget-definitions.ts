import { CoreWidgetDefinitions } from '@/lib/widget-definitions';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const merged: Record<
    string,
    { name: string; description: string; image: string }
  > = { ...CoreWidgetDefinitions };

  const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL || '';

  try {
    const response = await fetch(`${apiUrl}/api/plugin/registry`);
    if (response.ok) {
      const registry = await response.json();
      const widgetAdminComponents = registry.widgetAdminComponents || {};

      for (const [key, component] of Object.entries(widgetAdminComponents)) {
        if (!merged[key]) {
          const meta = component as {
            name?: string;
            description?: string;
            image?: string;
          };
          merged[key] = {
            name: meta.name || key,
            description: meta.description || '',
            image:
              meta.image || '/widget_preview/resource_overview_preview.png',
          };
        }
      }
    }
  } catch {
    // Plugin registry unavailable — continue with core widgets only
  }

  res.status(200).json(merged);
}
