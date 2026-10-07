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
      const next = {
        ...previewConfig,
        [subWidgetKey]: {
          ...previewConfig[subWidgetKey],
          ...config,
        },
      };
      updateConfig(next);
      updatePreview(next);
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
