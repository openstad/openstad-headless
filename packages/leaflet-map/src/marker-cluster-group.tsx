import LeafletMarkerClusterGroup from 'react-leaflet-cluster'
import type { MarkerCluster } from 'leaflet';
import type { MarkerClusterGroupProps } from './types/marker-cluster-group-props';

import Marker from './marker.jsx';
import amapsCreateClusterIcon from './lib/amaps-cluster-icon.js';

export default function MarkerClusterGroup({
  maxClusterRadius = 40,
  showCoverageOnHover = false,
  iconCreateFunction = amapsCreateClusterIcon,
  categorize = undefined,
  markers,
  ...props
}: MarkerClusterGroupProps) {

	function useIconCreateFunction(cluster: MarkerCluster) {
    // TODO: uitwerken default voor andere varianten dan amaps
		if (iconCreateFunction && typeof iconCreateFunction == 'string') iconCreateFunction = eval(iconCreateFunction);
    return iconCreateFunction(cluster, categorize); // 
  }

  return (
    <LeafletMarkerClusterGroup {...props} iconCreateFunction={useIconCreateFunction} maxClusterRadius={maxClusterRadius} showCoverageOnHover={showCoverageOnHover}>
      {markers.map((data) => 
        <Marker {...data} key={`marker-${data.markerId}`}/>
        )}
    </LeafletMarkerClusterGroup>
  );

}


