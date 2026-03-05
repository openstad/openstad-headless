import { CoreWidgetDefinitions } from '@/lib/widget-definitions';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const merged: Record<
    string,
    { name: string; description: string; image: string }
  > = { ...CoreWidgetDefinitions };

  try {
    const PluginLoader = require('@openstad-headless/plugin-loader');
    const pluginLoader = PluginLoader.getInstance();
    pluginLoader.load();
    const pluginWidgets = pluginLoader.getWidgetDefinitions();

    for (const [key, definition] of Object.entries(pluginWidgets) as [
      string,
      any,
    ][]) {
      if (merged[key]) {
        continue;
      }
      merged[key] = {
        name: definition.name || key,
        description: definition.description || '',
        image:
          definition.image || '/widget_preview/resource_overview_preview.png',
      };
    }
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(
        '[widget-definitions] Error loading plugin widgets:',
        err.message
      );
    }
  }

  res.status(200).json(merged);
}
