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
  categorize = undefined,
  markers,
  ...props
}: MarkerClusterGroupProps) {

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
