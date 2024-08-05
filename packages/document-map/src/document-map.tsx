import DataStore from '@openstad-headless/data-store/src';
import { Comments } from '@openstad-headless/comments/src/comments';
import hasRole from '../../lib/has-role';
import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading,
  Textarea,
  Button,
  FormLabel,
  Checkbox,
  Link
} from '@utrecht/component-library-react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useState, useRef, useEffect } from 'react';
import './document-map.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { MapContainer, ImageOverlay, useMapEvents, Popup, Marker, MarkerProps } from 'react-leaflet';
import { LatLngBoundsLiteral, CRS, Icon } from 'leaflet';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';

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
    minZoom?: number;
    maxZoom?: number;
    iconDefault?: string;
    iconHighlight?: string;
    sentiment?: string;
    canComment?: boolean;
    requiredUserRole?: string;
    accessibilityUrlVisible?: boolean;
    accessibilityUrl?: string;
    accessibilityUrlText?: string;
    definitiveUrlVisible?: boolean;
    definitiveUrl?: string;
    definitiveUrlText?: string;
    statusId?: string;
  };


function DocumentMap({
  zoom = 1,
  minZoom = -6,
  maxZoom = 10,
  iconDefault,
  iconHighlight = 'https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_1280.png',
  documentWidth = 1920,
  documentHeight = 1080,
  sentiment = 'no sentiment',
  accessibilityUrlVisible,
  definitiveUrlVisible,
  statusId,
  ...props
}: DocumentMapProps) {

  let resourceId: string | undefined = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

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
  const imageBounds: LatLngBoundsLiteral = [[-documentHeight, -documentWidth], [documentHeight, documentWidth]];
  const contentRef = useRef<HTMLDivElement>(null);
  const [shortLengthError, setShortLengthError] = useState(false);
  const [longLengthError, setLongLengthError] = useState(false);
  const [randomId, setRandomId] = useState('');

  const [toggleMarker, setToggleMarker] = useState(true);

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
  const [backUrl, setBackUrl] = useState<string>();


  useEffect(() => {
    setRandomId(generateRandomId());
    if (window.location.hash.includes('#doc')) {
      setBackUrl(window.location.hash.split('=')[1] + '=' + window.location.hash.split('=')[2]);
    }
  }, []);

  let args = {
    canComment: typeof props.comments?.canComment != 'undefined' ? props.comments.canComment : true,
    requiredUserRole: props.comments?.requiredUserRole || 'member',
  }

  const { data: currentUser } = datastore.useCurrentUser({ ...args });

  const [canComment, setCanComment] = useState(args.canComment)
  const [originalID, setOriginalID] = useState(undefined)
  const [isDefinitive, setIsDefinitive] = useState<boolean>()
  useEffect(() => {
    if (!resource) return;
    let statuses = resource.statuses || [];
    for (let status of statuses) {
      if (status.extraFunctionality?.canComment === false) {
        setCanComment(false)
      }
      if(status.id === Number(statusId)) {
        setIsDefinitive(true)
      }
    }
    if (resource.extraData?.originalId) {
      setOriginalID(resource.extraData?.originalId)
    }

  }, [resource]);


  if (canComment === false) args.canComment = canComment;

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

  const getUrl = () => {
    if (props.accessibilityUrl?.includes('[id]')) {
      return props.accessibilityUrl?.split('[id]')[0] + resourceId + '#doc=' + window.location.href.split('/').reverse()[0];
    } else {
      return props.accessibilityUrl + '#doc=' + window.location.href.split('/').reverse()[0];
    }
  }

  const getDefinitiveUrl = (originalID: string) => {
    if (props.definitiveUrl?.includes('[id]')) {
      return props.definitiveUrl?.split('[id]')[0] + originalID + '#doc=' + window.location.href.split('/').reverse()[0];
    } else {
      return props.definitiveUrl + '#doc=' + window.location.href.split('/').reverse()[0];
    }
  }


  return (
    <div className="documentMap--container">
      <div className="content" ref={contentRef}>
        <div className="documentMap--header">
          <div className='url-container'>
            {backUrl ? <Link href={backUrl} title="Terug naar overzicht" id={randomId}>Terug</Link> : null}
            <div className="url-list">
              {accessibilityUrlVisible ? <Link href={getUrl()} title="Bekijk tekstuele versie" id={randomId}>{props.accessibilityUrlText}</Link> : null}
              {definitiveUrlVisible && originalID !== undefined && isDefinitive ? <Link href={getDefinitiveUrl(originalID)} title="Bekijk originele versie" id={randomId}>{props.definitiveUrlText}</Link> : null}
            </div>
          </div>
          {!isDefinitive && (
            <div className='toggleMarkers'>
              <Checkbox id="toggleMarkers" defaultChecked onChange={() => setToggleMarker(!toggleMarker)} />
              <FormLabel htmlFor="toggleMarkers"> <Paragraph>Toon Markers</Paragraph> </FormLabel>
            </div>
          )}
        </div>
        <section className="content-intro">
          {resource.title ? <Heading level={1}>{resource.title}</Heading> : null}
          {resource.summary ? <Heading level={2} appearance={'utrecht-heading-5'}>{resource.summary}</Heading> : null}
          {resource.description ? <Paragraph>{resource.description}</Paragraph> : null}
        </section>

        {!isDefinitive && (
          <Comments
            {...props}
            resourceId={resourceId || ''}
            selectedComment={selectedCommentIndex}
            showForm={false}
          />
        )}
      </div>
      <div className={`map-container ${!toggleMarker ? '--hideMarkers' : ''}`}>
        <MapContainer center={[0, 0]} crs={CRS.Simple} maxZoom={maxZoom} minZoom={minZoom} zoom={zoom} >
          <MapEvents />
          {comments
            .filter((comment: any) => !!comment.location)
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
          {popupPosition && !isDefinitive && (
            <Popup position={popupPosition}>
              {args.canComment && !hasRole(currentUser, args.requiredUserRole) ? (
                <Paragraph>Om een reactie te plaatsen, moet je ingelogd zijn.</Paragraph>
              ) :
                <form>
                  <FormLabel htmlFor="commentBox">Voeg een opmerking toe</FormLabel>
                  {shortLengthError && <Paragraph className="--error">De opmerking moet minimaal 30 tekens bevatten</Paragraph>}
                  {longLengthError && <Paragraph className="--error">De opmerking mag maximaal 500 tekens bevatten</Paragraph>}
                  <Textarea name="comment" rows={3} id="commentBox"></Textarea>
                  <Button appearance="primary-action-button" type="submit" onClick={(e) => addComment(e, popupPosition)}>Insturen</Button>
                </form>}

            </Popup>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

DocumentMap.loadWidget = loadWidget;

export { DocumentMap };

