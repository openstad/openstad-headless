import { FormValue } from '@openstad-headless/form/src/form';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';

import type { MapPropsType } from '../types/index';
import { MarkerIconType } from './marker-icon';
import { MarkerProps } from './marker-props';

export type EditorMapWidgetProps = BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    fieldName: string;
    markerIcon: MarkerIconType;
    editorMarker?: MarkerProps;
    centerOnEditorMarker: boolean;
    onChange?: (e: {
      name: string;
      value: string | Record<number, never> | [] | { lat: number; lng: number };
    }) => void;
    fieldRequired?: boolean;
    searchLocation?: { lat: number; lng: number };
    minZoom: number;
    maxZoom: number;
    overrideDefaultValue?: FormValue;
    defaultValue?: FormValue;
  };
