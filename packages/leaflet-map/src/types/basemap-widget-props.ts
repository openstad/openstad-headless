import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { PostcodeAutoFillLocation } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';

import type { MapPropsType } from '../types/index';

export type MarkerSetConfig = {
  id: number;
  name: string;
};

export type CustomLegendItem = {
  label: string;
  color?: string;
  icon?: string;
};

export type BaseMapWidgetProps = BaseProps &
  ProjectSettingProps & {
    resourceId?: string;
    adminOnlyPolygons?: any;
    customPolygon?: any;
    interactionType?: 'default' | 'direct';
    mapDataLayers?: any;
    locationProx?: PostcodeAutoFillLocation;
    markerSets?: MarkerSetConfig[];
    markerInteractionType?: 'default' | 'direct';
    customLegend?: CustomLegendItem[];
  } & MapPropsType;
