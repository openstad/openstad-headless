import { TileLayer as LeafletTileLayer } from 'react-leaflet'
import type { MapTilesProps } from './types/map-tiles-props';
import { useEffect, useState } from 'react';

export default function TileLayer({
  tilesVariant = 'default',
  tiles = null,
  minZoom = 0,
  maxZoom = 25,
	customUrl = '',
  ...props
}: MapTilesProps) {
	const [activeTiles, setActiveTiles] = useState(tilesVariant);
	const [isChecking, setIsChecking] = useState(true);

	useEffect(() => {
		if (tilesVariant === 'nlmaps') {
			const testUrl = `https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/10/550/340.png`;

			const checkService = async () => {
				try {
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 3000);

					const response = await fetch(testUrl, {
						method: 'HEAD',
						signal: controller.signal,
					});

					clearTimeout(timeoutId);

					if (!response.ok) {
						setActiveTiles('openstreetmaps');
						setIsChecking(false);
					} else {
						setIsChecking(false);
					}
				} catch (error) {
					setActiveTiles('openstreetmaps');
					setIsChecking(false);
				}
			};

			checkService();
		} else {
			setIsChecking(false);
		}
	}, [tilesVariant]);

	if (isChecking) {
		return null;
	}

	switch (activeTiles) {
		case "amaps":
      return (
				<LeafletTileLayer
        {...props}
	      attribution="amsterdam.nl"
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 21 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 11 }
	      subdomains="1234"
        url="https://t{s}.data.amsterdam.nl/topo_wm/{z}/{x}/{y}.png"
          />)

		case "openstreetmaps":
      return (
        <LeafletTileLayer
        {...props}
        attribution="<a href='https://www.openstreetmap.org/copyright'>© OpenStreetMap contributors</a>"
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
        subdomains="abc"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />)

		case "n3s":
      return (
        <LeafletTileLayer
        {...props}
	      attribution=""
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
        subdomains="abcd"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />)

		case "custom":
      return (
        <LeafletTileLayer
        {...props}
        attribution={tiles && tiles.attribution || ''}
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
        subdomains={tiles && tiles.subdomains || ''}
        url={customUrl || 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png'}
          />)

		default:
		case "nlmaps":
      return (
        <LeafletTileLayer
        {...props}
	      attribution="Kaartgegevens &copy; <a href='kadaster.nl'>Kadaster</a>"
	      bounds={[[50.5, 3.25], [54, 7.6]]}
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 6 }
        subdomains=''
        url="https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png"
          />)

	}

}
