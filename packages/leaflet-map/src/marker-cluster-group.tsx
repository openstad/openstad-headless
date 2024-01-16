import LeafletMarkerClusterGroup from 'react-leaflet-cluster'
import { MarkerCluster } from 'leaflet';
import { MarkerClusterGroupProps } from './types/marker-cluster-group-props';

import Marker from './marker.jsx';
import amapsCreateClusterIcon from './lib/amaps-cluster-icon.js';

export default function MarkerClusterGroup({
  isActive = true,
  maxClusterRadius = 40,
  showCoverageOnHover = false,
  iconCreateFunction = amapsCreateClusterIcon,
  categorize = {
    categorizeByField: 'indeling',
    categories: {
      rood: {
        color: 'red',
        icon: {"html":"<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg width=\"34px\" height=\"45px\" viewBox=\"0 0 34 45\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><title>Path</title><g id=\"Stijlen-en-interacties\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><g id=\"Icons\" transform=\"translate(-1196.000000, -348.000000)\"><g id=\"plan-map-icon\" transform=\"translate(1196.000000, 348.000000)\"><path d=\"M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z\" id=\"Path\" fill=\"#EC0000\" fill-rule=\"nonzero\"></path><path d=\"M7.1946205,10.7093812 C7.067608,10.7642594 6.98974466,10.8940316 7.00109327,11.0319266 L7.00109327,26.5141047 L7.13011143,26.772141 L7.51716588,26.772141 L12.6133829,24.0627598 C12.7403954,24.0078816 12.8182587,23.8781094 12.8069101,23.7402145 L12.8069101,8.32254538 L12.6778919,8.06450908 L12.2908375,8.06450908 L7.1946205,10.7093812 Z M13.9680734,8.32254538 L14.0970916,8.06450908 L14.484146,8.06450908 L19.8383993,10.7738903 C19.9654118,10.8287685 20.0432752,10.9585407 20.0319266,11.0964356 L20.0319266,26.5786138 C20.0415796,26.6695457 20.0187263,26.7609587 19.9674175,26.8366501 L19.580363,26.8366501 L14.1616007,24.1272689 C14.0345882,24.0723907 13.9567248,23.9426184 13.9680734,23.8047235 L13.9680734,8.32254538 Z M26.4828341,8 L26.8698886,8 L26.9989067,8.2580363 L26.9989067,23.7402145 C27.0102553,23.8781094 26.932392,24.0078816 26.8053795,24.0627598 L21.7091625,26.772141 L21.3221081,26.772141 L21.1930899,26.5141047 L21.1930899,11.0319266 C21.1817413,10.8940316 21.2596046,10.7642594 21.3866171,10.7093812 L26.4828341,8 Z\" id=\"Shape\" fill=\"#FFFFFF\"></path></g></g></g></svg>","width":34,"height":45,"anchor":[17,45]},
      },
      oranje: {
        color: 'orange',
      },
      groen: {
        color: 'green',
        // icon: {"html":"<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg width=\"34px\" height=\"45px\" viewBox=\"0 0 34 45\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><title>Path</title><g id=\"Stijlen-en-interacties\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><g id=\"Icons\" transform=\"translate(-1196.000000, -348.000000)\"><g id=\"plan-map-icon\" transform=\"translate(1196.000000, 348.000000)\"><path d=\"M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z\" id=\"Path\" fill=\"#00A03C\" fill-rule=\"nonzero\"></path><path d=\"M7.1946205,10.7093812 C7.067608,10.7642594 6.98974466,10.8940316 7.00109327,11.0319266 L7.00109327,26.5141047 L7.13011143,26.772141 L7.51716588,26.772141 L12.6133829,24.0627598 C12.7403954,24.0078816 12.8182587,23.8781094 12.8069101,23.7402145 L12.8069101,8.32254538 L12.6778919,8.06450908 L12.2908375,8.06450908 L7.1946205,10.7093812 Z M13.9680734,8.32254538 L14.0970916,8.06450908 L14.484146,8.06450908 L19.8383993,10.7738903 C19.9654118,10.8287685 20.0432752,10.9585407 20.0319266,11.0964356 L20.0319266,26.5786138 C20.0415796,26.6695457 20.0187263,26.7609587 19.9674175,26.8366501 L19.580363,26.8366501 L14.1616007,24.1272689 C14.0345882,24.0723907 13.9567248,23.9426184 13.9680734,23.8047235 L13.9680734,8.32254538 Z M26.4828341,8 L26.8698886,8 L26.9989067,8.2580363 L26.9989067,23.7402145 C27.0102553,23.8781094 26.932392,24.0078816 26.8053795,24.0627598 L21.7091625,26.772141 L21.3221081,26.772141 L21.1930899,26.5141047 L21.1930899,11.0319266 C21.1817413,10.8940316 21.2596046,10.7642594 21.3866171,10.7093812 L26.4828341,8 Z\" id=\"Shape\" fill=\"#FFFFFF\"></path></g></g></g></svg>","width":34,"height":45,"anchor":[17,45]},
      },
      blauw: {
        color: 'blue',
        icon: {
          iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png",
          shadowUrl: "https://leafletjs.com/examples/custom-icons/leaf-shadow.png",
          iconSize: [38, 95],
          shadowSize:   [50, 64], // size of the shadow
          iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
        },
      },
      paars: {
        color: 'purple',
        icon: {"html":"<?xml version=\"1.0\" encoding=\"UTF-8\"?><svg width=\"34px\" height=\"45px\" viewBox=\"0 0 34 45\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><title>Path</title><g id=\"Stijlen-en-interacties\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><g id=\"Icons\" transform=\"translate(-1196.000000, -348.000000)\"><g id=\"plan-map-icon\" transform=\"translate(1196.000000, 348.000000)\"><path d=\"M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z\" id=\"Path\" fill=\"purple\" fill-rule=\"nonzero\"></path><path d=\"M7.1946205,10.7093812 C7.067608,10.7642594 6.98974466,10.8940316 7.00109327,11.0319266 L7.00109327,26.5141047 L7.13011143,26.772141 L7.51716588,26.772141 L12.6133829,24.0627598 C12.7403954,24.0078816 12.8182587,23.8781094 12.8069101,23.7402145 L12.8069101,8.32254538 L12.6778919,8.06450908 L12.2908375,8.06450908 L7.1946205,10.7093812 Z M13.9680734,8.32254538 L14.0970916,8.06450908 L14.484146,8.06450908 L19.8383993,10.7738903 C19.9654118,10.8287685 20.0432752,10.9585407 20.0319266,11.0964356 L20.0319266,26.5786138 C20.0415796,26.6695457 20.0187263,26.7609587 19.9674175,26.8366501 L19.580363,26.8366501 L14.1616007,24.1272689 C14.0345882,24.0723907 13.9567248,23.9426184 13.9680734,23.8047235 L13.9680734,8.32254538 Z M26.4828341,8 L26.8698886,8 L26.9989067,8.2580363 L26.9989067,23.7402145 C27.0102553,23.8781094 26.932392,24.0078816 26.8053795,24.0627598 L21.7091625,26.772141 L21.3221081,26.772141 L21.1930899,26.5141047 L21.1930899,11.0319266 C21.1817413,10.8940316 21.2596046,10.7642594 21.3866171,10.7093812 L26.4828341,8 Z\" id=\"Shape\" fill=\"#FFFFFF\"></path></g></g></g></svg>","width":34,"height":45,"anchor":[17,45]},
      },
    },
  },
  markers,
  ...props
}: MarkerClusterGroupProps) {

  // todo: useeffect op markers?

	function useIconCreateFunction(cluster: MarkerCluster) {
    // TODO: uitwerken default voor andere varianten dan amaps
		if (iconCreateFunction && typeof iconCreateFunction == 'string') iconCreateFunction = eval(iconCreateFunction);
    return iconCreateFunction(cluster, categorize); // 
  }

  //  onClick={e => self.onClusterClick(e)} onAnimationEnd={e => self.onClusterAnimationEnd(e)}
  return (
    <LeafletMarkerClusterGroup {...props} maxClusterRadius={maxClusterRadius} showCoverageOnHover={showCoverageOnHover} iconCreateFunction={useIconCreateFunction}>
      {markers.map((data, i: number) => 
        <Marker {...data} key={`marker-${i}`}/>
        )}
    </LeafletMarkerClusterGroup>
  );

}
