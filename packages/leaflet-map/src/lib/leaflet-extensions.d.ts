import * as L from 'leaflet';

declare module 'leaflet' {
  function mapInteraction(map: L.Map, options?: any): any;
}