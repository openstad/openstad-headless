import { FC } from "react";
import './map.css';
import { BaseProps } from "@openstad-headless/types/base-props.js";
import type { AreaProps } from '@openstad-headless/leaflet-map/src/types/area-props';
import { ProjectSettingProps } from "@openstad-headless/types/project-setting-props.js";
import { DataLayer } from "@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props";
export type MapProps = BaseProps & AreaProps & ProjectSettingProps & {
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: string | Record<number, never> | [];
    }) => void;
    requiredWarning?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    datalayer?: DataLayer[];
    enableOnOffSwitching?: boolean;
};
declare const MapField: FC<MapProps>;
export default MapField;
