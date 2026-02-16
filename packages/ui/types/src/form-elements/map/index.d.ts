import { FormValue } from '@openstad-headless/form/src/form';
import type { AreaProps } from '@openstad-headless/leaflet-map/src/types/area-props';
import { DataLayer } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { BaseProps } from '@openstad-headless/types/base-props.js';
import { ProjectSettingProps } from '@openstad-headless/types/project-setting-props.js';
import { FC } from 'react';

import './map.css';

export type MapProps = BaseProps &
  AreaProps &
  ProjectSettingProps & {
    overrideDefaultValue?: FormValue;
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    disabled?: boolean;
    type?: string;
    onChange?: (
      e: {
        name: string;
        value: FormValue;
      },
      triggerSetLastKey?: boolean
    ) => void;
    requiredWarning?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    datalayer?: DataLayer[];
    enableOnOffSwitching?: boolean;
    defaultValue?: FormValue;
    allowedPolygons?: Array<{
      id: number;
      name: string;
    }>;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
      value: string;
      label: string;
    }[];
    images?: Array<{
      url: string;
      name?: string;
      imageAlt?: string;
      imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    enablePolygonTags?: boolean;
    showHiddenPolygonsForAdmin?: boolean;
  };
declare const MapField: FC<MapProps>;
export default MapField;
