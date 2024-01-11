import { useState, useEffect } from 'react';
import { useWidgetConfig } from './use-widget-config';

export function useWidgetPreview<T extends {}>(): {
  previewConfig: T | undefined;
  updatePreview: (arg: T) => void;
} {
  const [previewConfig, setPreviewConfig] = useState<T>();

  const { data: widget } = useWidgetConfig();

  // Set the preview the first time the widget config is loaded
  useEffect(() => {
    const config = widget?.config;
    if (config) {
      setPreviewConfig({
        ...config,
      });
    }
  }, [widget?.config]);

  function updatePreview(config: T) {
    setPreviewConfig(config);
  }
  return { previewConfig, updatePreview };
}
