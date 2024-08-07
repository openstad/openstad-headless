import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import type { MapPropsType } from '../types/index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';

export type ResourceOverviewMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    marker?: MarkerProps;
    markerIcon?: MarkerIconType;
    markerHref?: string;
    countButton?: {
      show: boolean;
      label?: string;
    }
    ctaButton?: {
      show: boolean;
      label?: string;
      href?: string;
    }
    givenResources?: Array<any>
  };
