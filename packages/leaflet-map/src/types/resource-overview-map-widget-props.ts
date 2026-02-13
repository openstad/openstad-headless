import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { PostcodeAutoFillLocation } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';

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
    };
    ctaButton?: {
      show: boolean;
      label?: string;
      href?: string;
    };
    itemLink?: string;
    givenResources?: Array<any>;
    resourceOverviewMapWidget?: dataLayerArray;
    selectedProjects?: Array<any>;
    widgetName?: string;
    locationProx?: PostcodeAutoFillLocation;
    datalayer?: DataLayer[];
    enableOnOffSwitching?: boolean;
    displayDislike?: boolean;
    onMarkerClick?: (resource: any, index: number) => void;
  };

export type dataLayerArray = {
  datalayer?: DataLayer[];
  enableOnOffSwitching?: boolean;
};

export type DataLayer = {
  id: number | string;
  layer: any;
  icon: any;
  name: string;
  activeOnInit?: boolean;
};
