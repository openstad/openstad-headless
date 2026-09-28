import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

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
  updatePreview: (
    config:
      | ParentWidgetProps
      | ((prev: ParentWidgetProps | undefined) => ParentWidgetProps)
  ) => void;
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
    updateConfig: persistParentConfig,
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
      persistParentConfig(mergedConfig);
      // Keep the preview state in sync with what was just saved, so a
      // subsequent sibling save merges against fresh config instead of a
      // stale snapshot (prevents one column overwriting another).
      updatePreview(mergedConfig);
    },
    onFieldChanged: (key: string, value: any) => {
      updatePreview((prev) => {
        const base = prev ?? previewConfig;
        const subConfig = cloneDeep(base[subWidgetKey] ?? {});
        set(subConfig as any, key, value);
        return {
          ...base,
          [subWidgetKey]: subConfig,
        };
      });
    },
  };
  return extractedConfig;
}
