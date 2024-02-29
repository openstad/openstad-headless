import type { BaseProps } from '../../../types/base-props';
import type { ProjectSettingProps } from '../../../types/project-setting-props';
import type { MapPropsType } from './index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';

export type ResourceOverviewMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    link?:boolean;
    autoCenter?:boolean;
    marker: MarkerProps;
    markerIcon: MarkerIconType;
  };
