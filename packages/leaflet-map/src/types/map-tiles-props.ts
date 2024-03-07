type MapTiles = {
  url: string,
  subdomains?: string,
  attribution?: string,
};

export type MapTilesProps = {
  tilesVariant?: string,
  tiles?: MapTiles | null,
	minZoom?: number,
	maxZoom?: number,
};

