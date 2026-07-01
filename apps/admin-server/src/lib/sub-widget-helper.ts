type ConfigWithFunctions<ChildWidgetProps> = ChildWidgetProps & {
  updateConfig: (config: ChildWidgetProps) => void;
  onFieldChanged: (key: string, value: any) => void;
};

type ExtractConfigParams<
  ParentWidgetProps extends {},
  ChildWidgetProps extends {},
> = {
  subWidgetKey: keyof ParentWidgetProps;
  previewConfig: ParentWidgetProps | null;
  updateConfig: (config: ParentWidgetProps) => void;
  updatePreview: (config: ParentWidgetProps) => void;
  extraChildConfig?: Partial<ChildWidgetProps>;
  widgetName?: string;
};

export function extractConfig<
  ParentWidgetProps extends {},
  ChildWidgetProps extends {},
>(
  params: ExtractConfigParams<ParentWidgetProps, ChildWidgetProps>
): ConfigWithFunctions<ChildWidgetProps> {
  const {
    subWidgetKey,
    previewConfig,
    updateConfig,
    updatePreview,
    extraChildConfig,
  } = params;

  if (!previewConfig) throw new Error();

  const extractedConfig: ConfigWithFunctions<ChildWidgetProps> = {
    ...extraChildConfig,
    ...(previewConfig[subWidgetKey] as ChildWidgetProps),
    updateConfig: (config: ChildWidgetProps) => {
      const mergedConfig = {
        ...previewConfig,
        [subWidgetKey]: {
          ...previewConfig[subWidgetKey],
          ...config,
        },
      };
      updateConfig(mergedConfig);
      // Keep the preview state in sync with what was just saved, so a
      // subsequent sibling save merges against fresh config instead of a
      // stale snapshot (prevents one column overwriting another).
      updatePreview(mergedConfig);
    },
    onFieldChanged: (key: string, value: any) => {
      if (previewConfig) {
        updatePreview({
          ...previewConfig,
          [subWidgetKey]: {
            ...previewConfig[subWidgetKey],
            [key]: value,
          },
        });
      }
    },
  };
  return extractedConfig;
}
