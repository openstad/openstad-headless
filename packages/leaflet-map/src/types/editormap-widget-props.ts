import type { BaseProps } from '../../../types/base-props';
import type { ProjectSettingProps } from '../../../types/project-setting-props';
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
    onChange?: (e: {name: string, value: string | FileList | []}) => void;
    fieldRequired?: boolean;
  };
