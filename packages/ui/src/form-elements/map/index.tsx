import React, {FC} from "react";
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
    onChange?: (e: {name: string, value: string | FileList | []}) => void;
}

const MapField: FC<MapProps> = ({
    title,
    description,
    fieldKey,
    fieldRequired= false,
    onChange,
    ...props
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // TODO: Get map value when setting a marker. The function to retrieve the value is not yet implemented

    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const { data: areas } = datastore.useArea({
        projectId: props.projectId
    });

    let areaId = props?.project?.areaId || false;
    const polygon = areaId && Array.isArray(areas) && areas.length > 0 ? (areas.find(area => (area.id).toString() === areaId) || {}).polygon : [];

    function calculateZoom(minLat, maxLat, minLng, maxLng) {
        const visibleWidthDegrees = maxLng - minLng;
        const visibleHeightDegrees = maxLat - minLat;
        const visibleWidth = Math.abs(visibleWidthDegrees);
        const visibleHeight = Math.abs(visibleHeightDegrees);

        const visibleDimension = Math.max(visibleWidth, visibleHeight);

        const zoom = Math.ceil(8 - Math.log2(visibleDimension));

        return Math.max(0, Math.min(zoom, 25));
    }

    function calculateMapData(polygon) {
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

        const zoom = calculateZoom(minY, maxY, minX, maxX);

        const avgLat = (minY + maxY) / 2;
        const avgLng = (minX + maxX) / 2;

        return {
            center: {lat: avgLat, lng: avgLng},
            zoom: zoom
        };
    }

    let center = undefined;
    let zoom = 10;
    if (!!polygon && Array.isArray(polygon) && polygon.length > 0) {
        const mapData = calculateMapData(polygon)
        center = mapData?.center;
        zoom = mapData?.zoom || 10;
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
                  zoom={zoom}
                  area={polygon}
                  {...props}
              />
          </div>
      </FormField>
    );
}

export default MapField;
