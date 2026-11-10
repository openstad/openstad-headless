import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useWidgetConfig } from './use-widget-config';

const resetListeners = new Set<(widgetId: string) => void>();

export function resetWidgetPreview(widgetId: string | number) {
  resetListeners.forEach((listener) => listener(String(widgetId)));
}

export function subscribeWidgetPreviewReset(
  widgetId: string | number | string[] | undefined,
  onReset: () => void
) {
  const listener = (resetId: string) => {
    if (String(widgetId) === resetId) onReset();
  };
  resetListeners.add(listener);
  return () => {
    resetListeners.delete(listener);
  };
}

export function useWidgetPreview<T extends { [key: string]: any }>(
  widgetSettings: Partial<{
    [key in keyof T]: T[key];
  }>,
  idOverride?: string
): {
  previewConfig: T | undefined;
  updatePreview: (arg: T) => void;
} {
  const [previewConfig, setPreviewConfig] = useState<T>();
  const { data: widget, isLoading: isLoadingWidget } =
    useWidgetConfig<T>(idOverride);
  const router = useRouter();
  const widgetId = idOverride ?? router.query.id;

  // Set the preview the first time the widget config is loaded
  useEffect(() => {
    if (!previewConfig) {
      const config = widget?.config;
      if (typeof config === 'object')
        (
          config as { showAdminHiddenPolygonStyling?: boolean }
        ).showAdminHiddenPolygonStyling = true;

      if (config) {
        setPreviewConfig({
          ...config,
          ...widgetSettings,
          widgetId,
        });
      }
    }
  }, [widget?.config, previewConfig, widgetSettings]);

  useEffect(
    () =>
      subscribeWidgetPreviewReset(widgetId, () => setPreviewConfig(undefined)),
    [widgetId]
  );

  function updatePreview(config: T) {
    setPreviewConfig(config);
  }
  return { previewConfig, updatePreview };
}
