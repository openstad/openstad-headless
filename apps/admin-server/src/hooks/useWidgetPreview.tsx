import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useWidgetConfig } from './use-widget-config';

export function useWidgetPreview<T extends { [key: string]: any }>(
  widgetSettings: Partial<{
    [key in keyof T]: T[key];
  }>,
  idOverride?: string
): {
  previewConfig: T | undefined;
  updatePreview: (arg: T | ((prev: T | undefined) => T)) => void;
} {
  const [previewConfig, setPreviewConfig] = useState<T>();
  const { data: widget, isLoading: isLoadingWidget } =
    useWidgetConfig<T>(idOverride);
  const router = useRouter();
  const widgetId = idOverride ?? router.query.id;
  const seededWidgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentId = Array.isArray(widgetId) ? widgetId[0] : widgetId;
    if (previewConfig && seededWidgetIdRef.current === currentId) return;

    const config = widget?.config;
    if (!config) return;
    if (typeof config === 'object') {
      (config as any).showAdminHiddenPolygonStyling = true;
    }

    seededWidgetIdRef.current = currentId;
    setPreviewConfig({
      ...config,
      ...widgetSettings,
      widgetId,
    });
  }, [widget?.config, widgetId, previewConfig, widgetSettings]);

  const updatePreview = useCallback(
    (config: T | ((prev: T | undefined) => T)) => {
      setPreviewConfig(config as any);
    },
    []
  );
  return { previewConfig, updatePreview };
}
