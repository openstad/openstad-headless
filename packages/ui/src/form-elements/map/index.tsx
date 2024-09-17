import React, {FC} from "react";
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
import {LocationType} from "@openstad-headless/leaflet-map/src/types/location";
import {Spacer} from "../../spacer";

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
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
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

    let areaId = props?.map?.areaId || false;
    const polygon = areaId && Array.isArray(areas) && areas.length > 0 ? (areas.find(area => (area.id).toString() === areaId) || {}).polygon : [];


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

    const zoom = {
        minZoom: props?.map?.minZoom ? parseInt(props.map.minZoom) : 7,
        maxZoom: props?.map?.maxZoom ? parseInt(props.map.maxZoom) : 20
    }; 


    return (
      <FormField type="text">
          <Paragraph className="utrecht-form-field__label">
              <FormLabel htmlFor={randomID}>{title}</FormLabel>
          </Paragraph>
          <FormFieldDescription>{description}</FormFieldDescription>

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
                  <Spacer size={.5} />
              </>
          )}

          {infoImage && (
              <figure className="info-image-container">
                  <img src={infoImage} alt=""/>
                  <Spacer size={.5} />
              </figure>
          )}

          <div
            className="form-field-map-container"
            id={`map`}
          >
            {((areaId && polygon.length) || !areaId) && (
              <EditorMap
                  {...props}
                  fieldName={fieldKey}
                  center={center}
                  onChange={onChange}
                  fieldRequired={fieldRequired}
                  markerIcon={undefined}
                  centerOnEditorMarker={false}
                  autoZoomAndCenter='area'
                  area={polygon}
                  {...zoom}
              />
            )}
          </div>
      </FormField>
    );
}

export default MapField;
