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
import React, { useState, useRef, useEffect } from 'react';
import './documentMap.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { MapContainer, ImageOverlay, useMapEvents, Popup, Marker } from 'react-leaflet';
import { LatLngBoundsLiteral, CRS, Icon } from 'leaflet';

import 'leaflet/dist/leaflet.css';

export type DocumentMapProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
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
  resourceId,
  ...props
}: DocumentMapProps) {

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  });
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const { data: comments, isLoading: loading } = datastore.useComments({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const [popupPosition, setPopupPosition] = useState<any>(null);
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

  const contentRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<any>(null);

  const addComment = (e: any, position: any) => {
    const value = e.target.previousSibling.value;

    e.preventDefault();
    e.stopPropagation();

    if (value.length >= 30) {

      comments.create({
        description: value,
        location: position,
        createdAt: new Date(),
        sentiment: 'no sentiment',
      });

      if (commentsContainerRef.current) {
        commentsContainerRef.current = Date.now();
      }
      setPopupPosition(null)
    } else {
      return;
    }
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const [randomId, setRandomId] = useState('');

useEffect(() => {
  setRandomId(generateRandomId());
}, []);

  return (
    <div className="documentMap--container">
      <div className="content" tabIndex={0} ref={contentRef}>
        <section className="content-intro">
          {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
          {resource.summary ? <Heading level={5}>{resource.summary}</Heading> : null}
          {resource.description ? <Paragraph id={randomId}>{resource.description}</Paragraph> : null}
        </section>

        <Comments
          {...props}
          resourceId={resourceId || ''}
          type="image-resource"
          selectedComment={selectedCommentIndex}
        />

      </div>
      <div className='map-container'>
        <MapContainer center={[0, 0]} zoom={zoom} crs={CRS.Simple} minZoom={-6}>
          <MapEvents />
          {comments.map((comment: any, index: number) => (
            <Marker
              key={index}
              id={`marker-${index}`}
              position={comment.location}
              icon={index === selectedMarkerIndex ? highlightedIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (index === selectedMarkerIndex) {
                    setSelectedMarkerIndex(-1);
                    setSelectedCommentIndex(-1);
                  } else {
                    setSelectedMarkerIndex(index);
                    setSelectedCommentIndex(index);

                    const commentElement = document.getElementById(`comment-${index}`);
                    const commentPosition = commentElement?.offsetTop ?? 0;
                    const containerPosition = contentRef.current?.offsetTop ?? 0;
                    const scrollPosition = commentPosition - containerPosition;

                    contentRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
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

                      const commentElement = document.getElementById(`comment-${index}`);
                      const commentPosition = commentElement?.offsetTop ?? 0;
                      const containerPosition = contentRef.current?.offsetTop ?? 0;
                      const scrollPosition = commentPosition - containerPosition;

                      contentRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
                    }
                  }
                }
              }}
            >
            </Marker>
          ))}
          <ImageOverlay
            url={resource.images ? resource.images[0].url : 'https://fastly.picsum.photos/id/48/1920/1080.jpg?hmac=r2li6k6k9q34DhZiETPlmLsPPGgOChYumNm6weWMflI'}
            bounds={imageBounds}
            aria-describedby={randomId}
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

