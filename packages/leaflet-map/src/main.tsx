import React from 'react';
import ReactDOM from 'react-dom/client';
import { BaseMapWidgetProps, BaseMap } from './base-map.js';
import { EditorMapWidgetProps, EditorMap } from './editor-map.js';
import { ResourceDetailMapWidgetProps, ResourceDetailMap } from './resource-detail-map.js';
import { ResourceOverviewMapWidgetProps, ResourceOverviewMap } from './resource-overview-map.js';

const config: BaseMapWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  resourceId: import.meta.env.VITE_RESOURCE_ID || 1,
  tilesVariant: import.meta.env.VITE_TILES_VARIANT,
};

try {
  config.area = JSON.parse(import.meta.env.VITE_AREA);
} catch(err) {console.log(err);}

try {
  config.markers = JSON.parse(import.meta.env.VITE_MARKERS);
} catch(err) {console.log(err);}

try {
  config.clustering = JSON.parse(import.meta.env.VITE_CLUSTERING);
} catch(err) {console.log(err);}

try {
  config.categorize = JSON.parse(import.meta.env.VITE_CATEGORIZE);
} catch(err) {console.log(err);}
// TODO: dit moet naar env

config.onClick = function(e, map) {
  console.log('MAIN onClick')
}

config.onMarkerClick = function(e, map) {
  console.log('MAIN onMarkerKlick');
}

window.addEventListener( 'osc-map-click', e => {
  console.log('osc-map-click', e.detail);
});

window.addEventListener( 'osc-map-marker-click', e => {
  console.log('osc-map-marker-click', e.detail);
});

window.addEventListener( 'osc-map-is-ready', e => {
  console.log('osc-map-is-ready', e.detail);
});

let baseConfig = config; //{};

ReactDOM.createRoot(document.getElementById('map1')!).render(
  <React.StrictMode>
    <BaseMap {...baseConfig}/>
  </React.StrictMode>
);

let editorConfig:EditorMapWidgetProps = {
  ...config,
  markers: undefined,
  editorMarker: {
	  lat: 52.36904644463586,
	  lng: 4.930402911007405,
  },
}
ReactDOM.createRoot(document.getElementById('map2')!).render(
  <React.StrictMode>
    <EditorMap {...editorConfig}/>
  </React.StrictMode>
);

let ResourceOverviewConfig:ResourceOverviewMapWidgetProps = {
  ...config,
  markers: undefined,
  tilesVariant: 'nlmaps',
  autoZoomAndCenter: 'markers',
  clustering: {
    isActive: true,
  },
  categorize: {
    categorizeByField: 'theme',
  },
}

config.tilesVariant = 'amaps'
config.autoZoomAndCenter = 'area'
ReactDOM.createRoot(document.getElementById('map3')!).render(
  <React.StrictMode>
    <ResourceOverviewMap {...ResourceOverviewConfig}/>
  </React.StrictMode>
);

let ResourceDetailConfig:ResourceDetailMapWidgetProps = {
  ...config,
  markers: undefined,
  tilesVariant: 'nlmaps',
  autoZoomAndCenter: 'markers',
}

ReactDOM.createRoot(document.getElementById('map4')!).render(
  <React.StrictMode>
    <ResourceDetailMap {...ResourceDetailConfig}/>
  </React.StrictMode>
);


