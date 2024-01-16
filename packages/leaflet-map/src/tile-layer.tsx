import { TileLayer as LeafletTileLayer } from 'react-leaflet'
import { MapTilesProps } from './types/map-tiles-props';

export default function TileLayer({
  tilesVariant = 'default',
  tiles = null,
  minZoom = 0,
  maxZoom = 25,
  ...props
}: MapTilesProps) {

  switch(tilesVariant) {

		case "amaps":
      return (
				<LeafletTileLayer
        {...props}
        url="https://t{s}.data.amsterdam.nl/topo_wm/{z}/{x}/{y}.png"
	      subdomains="1234"
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 11 }
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 21 }
	      attribution="amsterdam.nl"
          />)

		case "openstreetmaps":
      return (
        <LeafletTileLayer
        {...props}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
        subdomains="abc"
        attribution="<a href='https://www.openstreetmap.org/copyright'>© OpenStreetMap contributors</a>"
          />)

		case "n3s":
      return (
        <LeafletTileLayer
        {...props}
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
        subdomains="abcd"
	      attribution=""
          />)

		case "custom":
      return (
        <LeafletTileLayer
        {...props}
        url={tiles && tiles.url || 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png'}
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
        subdomains={tiles && tiles.subdomains || ''}
        attribution={tiles && tiles.attribution}
          />)

		default:
		case "nlmaps":
      return (
        <LeafletTileLayer
        {...props}
        url="https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png"
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 6 }
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      bounds={[[50.5, 3.25], [54, 7.6]]}
        subdomains=''
	      attribution="Kaartgegevens &copy; <a href='kadaster.nl'>Kadaster</a>"
          />)

	}

}



