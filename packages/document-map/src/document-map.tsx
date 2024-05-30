import DataStore from '@openstad-headless/data-store/src';
import { Comments } from '@openstad-headless/comments/src/comments';

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
import './document-map.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { MapContainer, ImageOverlay, useMapEvents, Popup, Marker, MarkerProps } from 'react-leaflet';
import { LatLngBoundsLiteral, CRS, Icon } from 'leaflet';

import 'leaflet/dist/leaflet.css';

import MarkerIcon from '@openstad-headless/leaflet-map/src/marker-icon';

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
    sentiment?: string;
  };


function DocumentMap({
  zoom = 1,
  iconDefault,
  iconHighlight = 'https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_1280.png',
  documentWidth = 1920,
  documentHeight = 1080,
  resourceId,
  sentiment = 'no sentiment',
  ...props
}: DocumentMapProps) {

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const { data: comments } = datastore.useComments({
    projectId: props.projectId,
    resourceId: resourceId,
    sentiment: sentiment,
  });

  const [popupPosition, setPopupPosition] = useState<any>(null);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<Number>();
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<Number>();
  const defaultIcon = new Icon({ iconUrl: iconHighlight, className: 'defaultIcon' });
  const highlightedIcon = new Icon({ iconUrl: iconHighlight, className: 'highlightedIcon' });
  const imageBounds: LatLngBoundsLiteral = [[-documentHeight, -documentWidth], [documentHeight, documentWidth]];
  const contentRef = useRef<HTMLDivElement>(null);
  const [shortLengthError, setShortLengthError] = useState(false);
  const [longLengthError, setLongLengthError] = useState(false);
  const [randomId, setRandomId] = useState('');

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
    setShortLengthError(false);
    setLongLengthError(false);
    e.preventDefault();
    e.stopPropagation();

    if (value.length < 30) {
      setShortLengthError(true);
    }

    if (value.length > 500) {
      setLongLengthError(true);
    }

    if (value.length >= 30 && value.length <= 500) {

      comments.create({
        description: value,
        location: position,
        createdAt: new Date(),
        sentiment: 'no sentiment',
      });

      setPopupPosition(null)
      setShortLengthError(false);
      setLongLengthError(false);
    } else {
      return;
    }
  };

  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }


  useEffect(() => {
    setRandomId(generateRandomId());
  }, []);

  interface ExtendedMarkerProps extends MarkerProps {
    id: string;
    index: number;
  }

  const MarkerWithId: React.FC<ExtendedMarkerProps> = ({ id, index, ...props }) => {
    const markerRef = useRef<any>(null);

    const scrollToComment = (index: number) => {
      const comments = Array.from(document.getElementsByClassName('comment-item'));
      comments.forEach((comment) => comment.classList.remove('selected'));

      const commentElement = document.getElementById(`comment-${index}`);
      const commentPosition = commentElement?.offsetTop ?? 0;
      const containerPosition = contentRef.current?.offsetTop ?? 0;
      const scrollPosition = commentPosition - containerPosition;

      contentRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    };

    return (
      <Marker
        {...props}
        ref={markerRef}
        icon={MarkerIcon({ icon: { className: index === selectedMarkerIndex ? '--highlightedIcon' : '--defaultIcon' } })}
        eventHandlers={{
          click: () => {
            if (index === selectedMarkerIndex) {
              setSelectedMarkerIndex(-1);
              setSelectedCommentIndex(-1);
            } else {
              setSelectedMarkerIndex(index);
              setSelectedCommentIndex(index);
              scrollToComment(index);
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
                scrollToComment(index);
              }
            }
          }
        }}
      />
    );
  };

  return (
    <div className="documentMap--container">
      <div className="content" tabIndex={0} ref={contentRef}>
        <section className="content-intro">
          {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
          {resource.summary ? <Heading level={2} appearance={'utrecht-heading-5'}>{resource.summary}</Heading> : null}
          {resource.description ? <Paragraph id={randomId}>{resource.description}</Paragraph> : null}
        </section>

        <Comments
          {...props}
          resourceId={resourceId || ''}
          selectedComment={selectedCommentIndex}
          showForm={false}
        />
      </div>
      <div className='map-container'>
        <MapContainer center={[0, 0]} zoom={zoom} crs={CRS.Simple} minZoom={-6}>
          <MapEvents />
          {comments
            .filter((comment:any) => !!comment.location)
            .map((comment: any, index: number) => (
            <MarkerWithId
              key={index}
              id={`marker-${index}`}
              index={index}
              position={comment.location}
            >
            </MarkerWithId>
          ))}
          <ImageOverlay
            url={resource.images ? resource.images[0].url : ''}
            bounds={imageBounds}
            aria-describedby={randomId}
          />
          {popupPosition && (
            <Popup position={popupPosition}>
              <form>
                <FormLabel htmlFor="commentBox">Voeg een opmerking toe</FormLabel>
                {shortLengthError && <Paragraph className="--error">De opmerking moet minimaal 30 tekens bevatten</Paragraph>}
                {longLengthError && <Paragraph className="--error">De opmerking mag maximaal 500 tekens bevatten</Paragraph>}
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

