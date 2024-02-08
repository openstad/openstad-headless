type latlng = {
  lat?: number,
  lng?: number,
}

export type LocationType = {
  lat?: number,
  lng?: number,
  _latlng?: latlng,
  location?: {
    coordinates?: [number,number],
  } & latlng,
  position?: {
    coordinates?: [number,number],
  } & latlng,
};

