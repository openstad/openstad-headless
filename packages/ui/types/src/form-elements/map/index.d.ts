import { FC } from "react";
import './map.css';
import { BaseProps } from "@openstad-headless/types/base-props.js";
import type { AreaProps } from '@openstad-headless/leaflet-map/src/types/area-props';
import { ProjectSettingProps } from "@openstad-headless/types/project-setting-props.js";
import { DataLayer } from "@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props";
import { FormValue } from "@openstad-headless/form/src/form";
export type MapProps = BaseProps & AreaProps & ProjectSettingProps & {
    overrideDefaultValue?: FormValue;
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    requiredWarning?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    datalayer?: DataLayer[];
    enableOnOffSwitching?: boolean;
    defaultValue?: FormValue;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
};
declare const MapField: FC<MapProps>;
export default MapField;
