import { useState, useEffect } from 'react';
import { useWidgetConfig } from './use-widget-config';

export function useWidgetPreview<T extends {[key:string]:any}>(widgetSettings: Partial<{
  [key in keyof T]: T[key];
}>): {
  previewConfig: T | undefined;
  updatePreview: (arg: T) => void;
} {
  const [previewConfig, setPreviewConfig] = useState<T>();
  const { data: widget, isLoading: isLoadingWidget } = useWidgetConfig<T>();

  // Set the preview the first time the widget config is loaded
  useEffect(() => {
    if (!previewConfig) {
      const config = widget?.config;

      if (config) {
        setPreviewConfig({
          ...config,
          ...widgetSettings,
        });
      }
    }
  }, [widget?.config, previewConfig, widgetSettings]);

  function updatePreview(config: T) {
    setPreviewConfig(config);
  }
  return { previewConfig, updatePreview };
}
