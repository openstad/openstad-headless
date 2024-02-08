import type { MarkerProps } from '../types/marker-props';
import type { LocationType } from '../types/location';

export default function parseLocation(point: LocationType | MarkerProps) {
  // location can be given in a range of different formats but should be translated to { lat, lng }
	if (point._latlng) {
		point.lat = point._latlng.lat;
		point.lng = point._latlng.lng;
	} else if (point.location) {
    if (point.location.coordinates) {
		  point.lat = point.location.coordinates?.[0];
		  point.lng = point.location.coordinates?.[1];
    } else {
		  point.lat = point.location.lat;
		  point.lng = point.location.lng;
    }
  } else if (point.position) {
		point.lat = point.position.coordinates?.[0];
		point.lng = point.position.coordinates?.[1];
	}
}

