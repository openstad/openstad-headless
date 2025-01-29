import { useEffect, useRef, useCallback } from 'react';
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
  markers = [],
  ...props
}: MarkerClusterGroupProps) {

  let categorizeRef = useRef(categorize);
  useEffect(() => {
    categorizeRef.current = categorize;
  });

  let useIconCreateFunction = useCallback(
    function (cluster: MarkerCluster) {
      if (iconCreateFunction && typeof iconCreateFunction === 'string') {
        const globalFunction = globalThis[iconCreateFunction];
        if (typeof globalFunction === 'function') {
          iconCreateFunction = globalFunction;
        } else {
          console.warn(`Function ${iconCreateFunction} does not exist in the global scope.`);
          return null;
        }
      }

      if (typeof iconCreateFunction !== 'function') {
        console.warn(`iconCreateFunction is not a valid function.`);
        return null;
      }

      return iconCreateFunction(cluster, categorizeRef.current);
    },
    [markers]
  );

  return (
    <LeafletMarkerClusterGroup {...props} iconCreateFunction={useIconCreateFunction} maxClusterRadius={maxClusterRadius} showCoverageOnHover={showCoverageOnHover}>
      {markers?.map((data) => {
        return <Marker {...data} key={`marker-${data.markerId}`}/>
        })}
    </LeafletMarkerClusterGroup>
  );

}


