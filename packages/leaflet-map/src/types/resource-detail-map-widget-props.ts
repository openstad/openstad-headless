import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import type { MapPropsType } from './index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';


export type ResourceDetailMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    resourceId?: string | null;
    marker?: MarkerProps;
    markerIcon?: MarkerIconType;
    resourceIdRelativePath?: string;
  };