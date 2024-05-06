import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
} from '@utrecht/component-library-react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useState } from 'react';
import './documentMap.css';
import type { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { MapContainer, ImageOverlay, useMapEvents, Popup } from 'react-leaflet';
import { LatLngBoundsLiteral, CRS } from 'leaflet';

import 'leaflet/dist/leaflet.css';

export type DocumentMapProps = BaseProps &
  ProjectSettingProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
  };


function DocumentMap({
  ...props
}: DocumentMapProps) {

  
  const [popupPosition, setPopupPosition] = useState<any>(null);

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        setPopupPosition(e.latlng);
      },
    });

    return null;
  };


  const imageBounds: LatLngBoundsLiteral = [[-54, -96], [54, 96]];
  const imageUrl = 'https://fastly.picsum.photos/id/48/1920/1080.jpg?hmac=r2li6k6k9q34DhZiETPlmLsPPGgOChYumNm6weWMflI'; // replace with your image URL

  return (
    <div className="documentMap--container">
      <div className="content">
        test
      </div>
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }} crs={CRS.Simple}>
        <MapEvents />
        <ImageOverlay
          url={imageUrl}
          bounds={imageBounds}
          interactive={true}
        />
        {popupPosition && (
          <Popup position={popupPosition}>
            <strong>Je reactie:</strong><br /><textarea></textarea><br /><br /><button>Insturen</button>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}

DocumentMap.loadWidget = loadWidget;

export { DocumentMap };

