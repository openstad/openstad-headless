import React, {FC, useState} from "react";
import {FormField, FormFieldDescription, FormLabel, Paragraph} from "@utrecht/component-library-react";
import './map.css';
import {EditorMap} from "@openstad-headless/leaflet-map/src/editor-map";
import DataStore from "@openstad-headless/data-store/src";
import {BaseProps} from "@openstad-headless/types/base-props.js";
import {ProjectSettingProps} from "@openstad-headless/types/project-setting-props.js";

export type MapProps = BaseProps &
    ProjectSettingProps & {
    title: string;
    description: string;
    fieldKey: string;
    fieldRequired: boolean;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | FileList | []}) => void;
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

    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const { data: areas } = datastore.useArea({
        projectId: props.projectId
    });

    let areaId = props?.project?.areaId || false;
    const polygon = areaId && Array.isArray(areas) && areas.length > 0 ? (areas.find(area => (area.id).toString() === areaId) || {}).polygon : [];

    function calculateCenter(polygon) {
        if (!polygon || polygon.length === 0) {
            return null;
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

    let center = undefined;
    if (!!polygon && Array.isArray(polygon) && polygon.length > 0) {
        center = calculateCenter(polygon);
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
                  area={polygon}
                  onChange={onChange}
                  fieldRequired={fieldRequired}
                  {...props}
              />
          </div>
      </FormField>
    );
}

export default MapField;
