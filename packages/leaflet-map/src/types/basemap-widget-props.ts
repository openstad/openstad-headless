import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

import type { MapPropsType } from '../types/index';
import {PostcodeAutoFillLocation} from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";

export type BaseMapWidgetProps = BaseProps &
  ProjectSettingProps & {
    resourceId?: string;
    customPolygon?: any;
    interactionType?: 'default' | 'direct';
    mapDataLayers?: any;
    locationProx?: PostcodeAutoFillLocation
  } & MapPropsType;
