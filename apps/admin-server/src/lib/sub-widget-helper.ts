import { asDefaultType } from '@/hooks/useWidgetDraft';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
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
  updatePreview: (
    config:
      | ParentWidgetProps
      | ((prev: ParentWidgetProps | undefined) => ParentWidgetProps)
  ) => void;
  extraChildConfig?: Partial<ChildWidgetProps>;
  widgetName?: string;
};

function withDraftPrefix<F extends (key: string, value: any) => void>(
  fn: F,
  prefix: string
): F & { draftPrefix: string } {
  return Object.assign(fn, { draftPrefix: prefix });
}

export function extractConfig<
  ParentWidgetProps extends {},
  ChildWidgetProps extends {},
>(
  params: ExtractConfigParams<ParentWidgetProps, ChildWidgetProps>
): ConfigWithFunctions<ChildWidgetProps> {
  const { subWidgetKey, previewConfig, updatePreview, extraChildConfig } =
    params;

  if (!previewConfig) throw new Error();

  const extractedConfig: ConfigWithFunctions<ChildWidgetProps> = {
    ...extraChildConfig,
    ...(previewConfig[subWidgetKey] as ChildWidgetProps),
    updateConfig: () => {},
    onFieldChanged: withDraftPrefix((key: string, value: any) => {
      updatePreview((prev) => {
        const base = prev ?? previewConfig;
        const subConfig = cloneDeep(base[subWidgetKey] ?? {});
        set(subConfig as any, key, asDefaultType(value, get(subConfig, key)));
        return {
          ...base,
          [subWidgetKey]: subConfig,
        };
      });
    }, String(subWidgetKey)),
  };
  return extractedConfig;
}
