import DataStore from '@openstad-headless/data-store/src';
import { Comments } from '@openstad-headless/comments/src/comments';

import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading,
  Textarea,
  Button,
  FormLabel
} from '@utrecht/component-library-react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useState } from 'react';
import './documentMap.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { MapContainer, ImageOverlay, useMapEvents, Popup, Marker } from 'react-leaflet';
import { LatLngBoundsLiteral, CRS, Icon } from 'leaflet';

import 'leaflet/dist/leaflet.css';

export type DocumentMapProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    imageResourceId?: string;
    resourceIdRelativePath?: string;
    documentWidth?: number;
    documentHeight?: number;
    zoom?: number;
    iconDefault?: string;
    iconHighlight?: string;
  };


function DocumentMap({
  zoom = 1,
  iconDefault,
  iconHighlight = 'https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_1280.png',
  documentWidth = 1920,
  documentHeight = 1080,
  titleTekst,
  introTekst,
  imageResourceId,
  ...props
}: DocumentMapProps) {

  let resourceId: string | undefined = String(getResourceId({
    resourceId: parseInt(imageResourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  }));

  const datastore = new DataStore({
    projectId: props.projectId,
    imageResource: imageResourceId,
    api: props.api,
  });
  const { data: resource } = datastore.useImageResource({
    projectId: props.projectId,
    imageResourceId: imageResourceId,
  });

  const { data: comments } = datastore.useComments({
    projectId: props.projectId,
    resourceId: imageResourceId,
    type: 'image-resource',
  });


  const [popupPosition, setPopupPosition] = useState<any>(null);
  // const [comments, setComments] = useState<Array<{ comment: string, position: any, date: any }>>([]);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<Number>();
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<Number>();

  const defaultIcon = new Icon({ iconUrl: iconHighlight, className: 'defaultIcon' });
  const highlightedIcon = new Icon({ iconUrl: iconHighlight, className: 'highlightedIcon' });

  const imageBounds: LatLngBoundsLiteral = [[-documentHeight, -documentWidth], [documentHeight, documentWidth]];

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        setPopupPosition(e.latlng);
      },
      popupclose: () => {
        setSelectedCommentIndex(-1);
        setSelectedMarkerIndex(-1);
      },
    });

    return null;
  };

  const addComment = (e: any, position: any) => {
    const value = e.target.previousSibling.value;

    e.preventDefault();
    e.stopPropagation();

    if (value.length > 0) {
      // setComments([...comments, { comment: value, position, date: new Date() }]);
      setPopupPosition(null)
    } else {
      return;
    }
  };


  return (
    <div className="documentMap--container">
      <div className="content" tabIndex={0}>
        <section className="content-intro">
          {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
          {resource.summary ? <Heading level={5}>{resource.summary}</Heading> : null}
          {resource.description ? <Paragraph>{resource.description}</Paragraph> : null}
        </section>

        <Comments
          {...props}
          imageResourceId={imageResourceId || ''}
          type="image-resource"
        />

      </div>
      <div className='map-container'>
        <MapContainer center={[0, 0]} zoom={zoom} crs={CRS.Simple} minZoom={-6}>
          <MapEvents />
          {/* {comments.map((comment, index) => (
            <Marker
              key={index}
              position={comment.position}
              icon={index === selectedMarkerIndex ? highlightedIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (index === selectedMarkerIndex) {
                    setSelectedMarkerIndex(-1);
                    setSelectedCommentIndex(-1);
                  } else {
                    setSelectedMarkerIndex(index);
                    setSelectedCommentIndex(index);
                  }
                },
                keydown: (e: L.LeafletKeyboardEvent) => {
                  if (e.originalEvent.key === 'Enter') {
                    if (index === selectedMarkerIndex) {
                      setSelectedMarkerIndex(-1);
                      setSelectedCommentIndex(-1);
                    } else {
                      setSelectedMarkerIndex(index);
                      setSelectedCommentIndex(index);
                    }
                  }
                }
              }}
            >
            </Marker>
          ))} */}
          <ImageOverlay
            url={resource.images ? resource.images[0].url : 'https://fastly.picsum.photos/id/48/1920/1080.jpg?hmac=r2li6k6k9q34DhZiETPlmLsPPGgOChYumNm6weWMflI'}
            bounds={imageBounds}
          />
          {popupPosition && (
            <Popup position={popupPosition}>
              <form>
                <FormLabel htmlFor="commentBox">Voeg een opmerking toe</FormLabel>
                <Textarea name="comment" rows={3} id="commentBox"></Textarea>
                <Button appearance="primary-action-button" type="submit" onClick={(e) => addComment(e, popupPosition)}>Insturen</Button>
              </form>
            </Popup>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

DocumentMap.loadWidget = loadWidget;

export { DocumentMap };

