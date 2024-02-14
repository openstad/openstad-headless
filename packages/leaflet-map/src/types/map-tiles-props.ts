type MapTiles = {
  url: string,
  subdomains?: string,
  attribution?: string,
};

export type MapTilesProps = {
  tilesVariant?: string,
  tiles?: MapTiles,
	minZoom?: number,
	maxZoom?: number,
};

