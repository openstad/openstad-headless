import type { BaseProps } from '../../../types/base-props';
import type { ProjectSettingProps } from '../../../types/project-setting-props';
import type { MapPropsType } from './index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';


export type ResourceDetailMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    resourceId?: number;
    marker?: MarkerProps;
    markerIcon: MarkerIconType;
  };