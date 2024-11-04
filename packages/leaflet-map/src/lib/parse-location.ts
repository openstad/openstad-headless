import type { MarkerProps } from '../types/marker-props';
import type { LocationType } from '../types/location';
import { LatLng } from 'leaflet';

export default function parseLocation(point: LocationType | MarkerProps | Array<LocationType | MarkerProps>) : LatLng | LatLng[] {
  // Controleer of het punt een array is
  if (Array.isArray(point)) {
    return point.map(p => parseSingleLocation(p));
  } else {
    return parseSingleLocation(point);
  }
}

function parseSingleLocation(point: LocationType | MarkerProps) : LatLng {
  // location can be given in a range of different formats but should be translated to { lat, lng }
  let lat = 0;
  let lng = 0;

  if (point._latlng) {
    lat = point._latlng.lat || lat;
    lng = point._latlng.lng || lng;
  } else if (point.lat && point.lng) {
    lat = point.lat;
    lng = point.lng;
  } else if (point.location) {
    lat = point.location?.lat || point.location?.coordinates?.at(0) || lat;
    lng = point.location?.lng || point.location?.coordinates?.at(1) || lng;
  } else if (point.position) {
    lat = point.position?.lat || point.position?.coordinates?.at(0) || lat;
    lng = point.position?.lng || point.position?.coordinates?.at(1) || lng;
  }
  return new LatLng(lat, lng);
}