import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading,
  ButtonLink,
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
    documentUrl?: string;
    documentWidth?: number;
    documentHeight?: number;
    zoom?: number;
    iconDefault?: string;
    iconHighlight?: string;
  };


function DocumentMap({
  documentUrl,
  zoom = 1,
  iconDefault,
  iconHighlight = 'https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740_1280.png',
  documentWidth = 1080,
  documentHeight = 1920,
  ...props
}: DocumentMapProps) {


  const [popupPosition, setPopupPosition] = useState<any>(null);
  const [comments, setComments] = useState<Array<{ comment: string, position: any, date: any }>>([]);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<Number>();
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<Number>();

  console.log(iconDefault === undefined ? 'undefined' : 'test')
  const defaultIcon = new Icon({ iconUrl: iconHighlight, className: 'defaultIcon'});
  const highlightedIcon = new Icon({ iconUrl: iconHighlight, className: 'highlightedIcon'});

  const imageBounds: LatLngBoundsLiteral = [[-documentWidth / 10, -documentHeight / 10], [documentWidth / 10, documentHeight / 10]];

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
      setComments([...comments, { comment: value, position, date: new Date() }]);
      setPopupPosition(null)
    } else {
      return;
    }
  };


  return (
    <div className="documentMap--container">
      <div className="content" tabIndex={0}>
        <header>
          <Paragraph>
            Klik op de kaart om een opmerking toe te voegen.
          </Paragraph>
        </header>
        {comments.map((comment, index) => (
          <>
            <button
              key={index}
              className={`comment ${index === selectedCommentIndex ? 'highlight' : ''}`}
              onClick={(e) => {
                if ((e.currentTarget as Element).classList.contains('highlight')) {
                  setSelectedMarkerIndex(-1);
                  setSelectedCommentIndex(-1);
                } else {
                  setSelectedMarkerIndex(index);
                  setSelectedCommentIndex(index);
                }
              }}
            >
              <Paragraph>
                {comment.comment}
              </Paragraph>
              <Paragraph className="flex">
                <span>Geplaatst door: Anoniem</span>
                <span>Datum: {comment.date.toLocaleDateString()}, {comment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </Paragraph>
            </button>
          </>

        ))}
      </div>
      <div className='map-container'>
        <MapContainer center={[0, 0]} zoom={zoom} crs={CRS.Simple}>
          <MapEvents />
          {comments.map((comment, index) => (
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
          ))}
          <ImageOverlay
            url={documentUrl ? documentUrl : 'https://fastly.picsum.photos/id/48/1920/1080.jpg?hmac=r2li6k6k9q34DhZiETPlmLsPPGgOChYumNm6weWMflI'}
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

