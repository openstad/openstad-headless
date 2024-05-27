import React, {FC} from "react";
import {FormField, FormFieldDescription, FormLabel, Paragraph} from "@utrecht/component-library-react";
import './map.css';
import {EditorMap} from "@openstad-headless/leaflet-map/src/editor-map";
import {BaseProps} from "@openstad-headless/types/base-props.js";
import type {AreaProps} from '@openstad-headless/leaflet-map/src/types/area-props';
import {ProjectSettingProps} from "@openstad-headless/types/project-setting-props.js";
import {LocationType} from "@openstad-headless/leaflet-map/src/types/location";

export type MapProps = BaseProps &
    AreaProps &
    ProjectSettingProps & {
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {name: string, value: string | Record<number, never> | []}) => void;
    requiredWarning?: string;
}

type Point = {
    lat: number;
    lng: number;
}

const MapField: FC<MapProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired= false,
    onChange,
    disabled = false,
    ...props
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    function calculateCenter(polygon: Point[]) {
        if (!polygon || polygon.length === 0) {
            return undefined;
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        polygon.forEach(point => {
            if (point.lng < minX) minX = point.lng;
            if (point.lng > maxX) maxX = point.lng;
            if (point.lat < minY) minY = point.lat;
            if (point.lat > maxY) maxY = point.lat;
        });

        const avgLat = (minY + maxY) / 2;
        const avgLng = (minX + maxX) / 2;

        return {lat: avgLat, lng: avgLng};
    }

    let center: LocationType | undefined = undefined;
    if (!!props.area && Array.isArray(props.area) && props.area.length > 0) {
      center = calculateCenter(props.area);
    }

    return (
      <FormField type="text">
          <Paragraph className="utrecht-form-field__label">
              <FormLabel htmlFor={randomID}>{title}</FormLabel>
          </Paragraph>
          <FormFieldDescription>{description}</FormFieldDescription>
          <div
            className="form-field-map-container"
            id={`map`}
          >
              <EditorMap
                  autoZoomAndCenter="area"
                  fieldName={fieldKey}
                  center={center}
                  onChange={onChange}
                  fieldRequired={fieldRequired}
                  markerIcon={undefined}
                  centerOnEditorMarker={false}
                  {...props}
              />
          </div>
      </FormField>
    );
}

export default MapField;
