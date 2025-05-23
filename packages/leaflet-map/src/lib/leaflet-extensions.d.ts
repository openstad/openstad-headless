import * as L from 'leaflet';

declare module 'leaflet' {
  // Add the mapInteraction function to the L namespace
  function mapInteraction(map: L.Map, options?: any): any;
}