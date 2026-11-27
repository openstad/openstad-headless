import L from 'leaflet';
import type { MarkerCluster } from 'leaflet';
import { useCallback, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import LeafletMarkerClusterGroup from 'react-leaflet-cluster';

import amapsCreateClusterIcon from './lib/amaps-cluster-icon.js';
import {
  activateClusterOnSpace,
  disableClusterPanOnFocus,
} from './lib/clustering-config';
import Marker from './marker';
import type { MarkerClusterGroupProps } from './types/marker-cluster-group-props';

disableClusterPanOnFocus(L);

export default function MarkerClusterGroup({
  maxClusterRadius = 40,
  showCoverageOnHover = false,
  iconCreateFunction = amapsCreateClusterIcon,
  categorize = undefined,
  markers = [],
  children = undefined,
  ...props
}: MarkerClusterGroupProps) {
  let categorizeRef = useRef(categorize);
  useEffect(() => {
    categorizeRef.current = categorize;
  });

  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup>(null);
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const handleClusterKeydown = (event: L.LeafletEvent) =>
      activateClusterOnSpace(event, map.getContainer());
    group.on('clusterkeydown', handleClusterKeydown);
    return () => {
      group.off('clusterkeydown', handleClusterKeydown);
    };
  }, [map]);

  let useIconCreateFunction = useCallback(
    function (cluster: MarkerCluster) {
      if (iconCreateFunction && typeof iconCreateFunction === 'string') {
        const globalFunction = globalThis[iconCreateFunction];
        if (typeof globalFunction === 'function') {
          iconCreateFunction = globalFunction;
        } else {
          console.warn(
            `Function ${iconCreateFunction} does not exist in the global scope.`
          );
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

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    // @ts-ignore
    <LeafletMarkerClusterGroup
      {...(prefersReducedMotion ? { animate: false } : {})}
      {...props}
      ref={groupRef}
      iconCreateFunction={useIconCreateFunction}
      maxClusterRadius={maxClusterRadius}
      showCoverageOnHover={showCoverageOnHover}>
      {markers?.map((data) => {
        // @ts-ignore
        return <Marker {...data} key={`marker-${data.markerId}`} />;
      })}
      {children}
    </LeafletMarkerClusterGroup>
  );
}
