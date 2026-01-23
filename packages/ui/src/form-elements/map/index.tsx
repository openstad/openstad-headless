import React, {FC, useEffect, useMemo, useState} from "react";
import {
    AccordionProvider,
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph
} from "@utrecht/component-library-react";
import './map.css';
import {EditorMap} from "@openstad-headless/leaflet-map/src/editor-map";
import DataStore from '@openstad-headless/data-store/src';
import {BaseProps} from "@openstad-headless/types/base-props.js";
import type {AreaProps} from '@openstad-headless/leaflet-map/src/types/area-props';
import {ProjectSettingProps} from "@openstad-headless/types/project-setting-props.js";
import {Spacer} from "../../spacer";
import { DataLayer } from "@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props";
import { FormValue } from "@openstad-headless/form/src/form";
import {InfoImage} from "../../infoImage";
import { isPointInArea } from "@openstad-headless/leaflet-map/src/area";
import { getTargetAreaIds, resolveMapPolygons } from "./utils/polygons";
import { resolvePolygonTags } from "./utils/polygon-tags";

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
    onChange?: (e: {name: string, value: FormValue}, triggerSetLastKey?: boolean) => void;
    requiredWarning?: string;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    datalayer?: DataLayer[];
    enableOnOffSwitching?: boolean;
    defaultValue?: FormValue;
    allowedPolygons?: Array<{ id: number; name: string }>;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: { value: string; label: string }[];
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
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
    infoImage = '',
    datalayer = [],
    enableOnOffSwitching = false,
    defaultValue = {},
    overrideDefaultValue = {},
    images = [],
    createImageSlider = false,
    imageClickable = false,
    ...props
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    const datastore = new DataStore({
        projectId: props.projectId,
        api: props.api,
        config: { api: props.api },
    });

    const { data: areas } = datastore.useArea({
        projectId: props.projectId
    });

    const areaId = props?.map?.areaId;
    const allowedPolygonIds = (props?.allowedPolygons || []).map((poly) => poly.id);
    const {
        safeAreas,
        hasAllowedPolygons,
        adminOnlyPolygons,
        hasHiddenAdminPolygons,
        polygon,
        renderPolygon,
    } = resolveMapPolygons({
        areas,
        areaId,
        allowedPolygonIds,
        showHiddenPolygonsForAdmin: !!props.showHiddenPolygonsForAdmin,
    });
    const polygonTagFieldKey = `${fieldKey}__polygonTagIds`;

    function calculateCenter(points: Point[]) {
        if (!points || points.length === 0) {
            return undefined;
        }

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        points.forEach(point => {
            if (point.lng < minX) minX = point.lng;
            if (point.lng > maxX) maxX = point.lng;
            if (point.lat < minY) minY = point.lat;
            if (point.lat > maxY) maxY = point.lat;
        });

        const avgLat = (minY + maxY) / 2;
        const avgLng = (minX + maxX) / 2;

        return {lat: avgLat, lng: avgLng};
    }

    const currentCenter = useMemo(() => {
        if (!polygon || polygon.length === 0) return undefined;
        const flatPoints = Array.isArray(polygon[0])
            ? (polygon as Point[][]).flat()
            : (polygon as Point[]);
        return calculateCenter(flatPoints);
    }, [polygon]);

    const zoom = {
        minZoom: props?.map?.minZoom ? parseInt(props.map.minZoom) : 7,
        maxZoom: props?.map?.maxZoom ? parseInt(props.map.maxZoom) : 20
    };

    const dataLayerSettings = {
        datalayer: datalayer,
        enableOnOffSwitching: enableOnOffSwitching,
    }

    const resolvePolygonTagsForLocation = (location?: { lat?: number; lng?: number }) =>
        resolvePolygonTags({
            enablePolygonTags: props.enablePolygonTags,
            location,
            safeAreas,
            targetAreaIds: getTargetAreaIds({
                hasAllowedPolygons,
                allowedPolygonIds,
                areaId,
            }),
            isPointInArea,
        });

    const handleMapChange = (event: { name: string, value: FormValue }) => {
        if (onChange) {
            onChange(event);
        }

        if (event.name === fieldKey) {
            const tagIds = resolvePolygonTagsForLocation(event.value as any);
            if (onChange) {
                onChange({ name: polygonTagFieldKey, value: tagIds }, false);
            }
        }
    };

    return (
      <FormField type="text">

          {title && (
              <Paragraph className="utrecht-form-field__label">
                  <FormLabel htmlFor={randomID} dangerouslySetInnerHTML={{ __html: title }} />
              </Paragraph>
          )}

          {description &&
            <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
          }

          {showMoreInfo && (
              <>
                  <AccordionProvider
                      sections={[
                          {
                              headingLevel: 3,
                              body: <HtmlContent html={moreInfoContent} />,
                              expanded: undefined,
                              label: moreInfoButton,
                          }
                      ]}
                  />
                  <Spacer size={1.5} />
              </>
          )}

          {InfoImage({
              imageFallback: infoImage || '',
              images: images,
              createImageSlider: createImageSlider,
              addSpacer: !!infoImage,
              imageClickable: imageClickable
          })}

          {!!props.showHiddenPolygonsForAdmin && hasHiddenAdminPolygons && (
              <div className="map-hidden-polygons-message">
                  <Paragraph>
                      Let op: polygonen met rode vulling en een gestippelde rand zijn verborgen voor gebruikers aan de voorkant. Deze zijn alleen zichtbaar voor beheerders in de admin omgeving.
                  </Paragraph>
              </div>
          )}

          <div
            className="form-field-map-container"
            id={`map`}
          >
            {((allowedPolygonIds.length > 0 && polygon.length) || (areaId && polygon.length) || (!Number(areaId) && allowedPolygonIds.length === 0)) && (
              <EditorMap
                  {...props}
                  fieldName={fieldKey}
                  center={currentCenter}
                  onChange={handleMapChange}
                  fieldRequired={fieldRequired}
                  markerIcon={undefined}
                  centerOnEditorMarker={false}
                  autoZoomAndCenter={props?.map?.autoZoomAndCenter || 'area'}
                  area={polygon}
                  renderArea={renderPolygon}
                  adminOnlyPolygons={ !!props.showHiddenPolygonsForAdmin ? adminOnlyPolygons : undefined}
                  {...zoom}
                  dataLayerSettings={dataLayerSettings}
                  defaultValue={defaultValue}
                  overrideDefaultValue={overrideDefaultValue}
              />
            )}
          </div>
      </FormField>
    );
}

export default MapField;
