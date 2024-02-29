import type { BaseProps } from '../../../types/base-props';
import type { ProjectSettingProps } from '../../../types/project-setting-props';
import type { MapPropsType } from '../types/index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';

export type ResourceOverviewMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    marker: MarkerProps;
    markerIcon: MarkerIconType;
  };
