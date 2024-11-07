type MapTiles = {
  url: string,
  subdomains?: string,
  attribution?: string,
};

export type MapTilesProps = {
  tilesVariant?: string,
  customUrl?: string,
  tiles?: MapTiles | null,
	minZoom?: number,
	maxZoom?: number,
};

