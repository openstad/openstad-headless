import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { PostcodeAutoFillLocation } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';

import type { MapPropsType } from '../types/index';

export type BaseMapWidgetProps = BaseProps &
  ProjectSettingProps & {
    resourceId?: string;
    adminOnlyPolygons?: any;
    customPolygon?: any;
    interactionType?: 'default' | 'direct';
    mapDataLayers?: any;
    locationProx?: PostcodeAutoFillLocation;
  } & MapPropsType;
