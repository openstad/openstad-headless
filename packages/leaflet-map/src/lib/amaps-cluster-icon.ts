import {divIcon, MarkerOptions, point} from 'leaflet';
import type { MarkerCluster } from 'leaflet';

export default function amapsCreateClusterIcon(
    cluster: MarkerCluster,
    categorize = {
      categorizeByField: 'nocategorization',
      categories: {},
    }
) {
  let clusterMarkers = cluster.getAllChildMarkers();

  let colors: { [key: string]: number } = {};
  let total = clusterMarkers.length;
  let isFaded = true;
  clusterMarkers.forEach((clusterMarker) => {
    let marker = clusterMarker.options as MarkerOptions & { data?: Record<string, unknown> };
    if (!marker) return console.log('Marker not found:', clusterMarker);
    let category = getCategory(marker, categorize.categorizeByField);
    let color: string;
    if (
        typeof category === 'string' &&
        categorize.categories.hasOwnProperty(category)
    ) {
      color = (categorize.categories[category as keyof typeof categorize.categories] as { color: string }).color; // Haal de color-eigenschap op
    } else {
      color = '#164995';
    }

    if (!colors[color]) colors[color] = 0;
    colors[color]++;
    if (!(marker && 'isFaded' in marker && marker?.isFaded)) isFaded = false;
  });


  let html = '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="white"/>';

  let soFar = 0;
  Object.keys(colors).forEach((key) => {
    let myColor = key;
    let perc = (100 * colors[key]) / total;
    let angle = (soFar / 100) * 360;
    
    html += `    <path
      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      fill="none"
      transform="rotate(${angle}, 18, 18)"
      stroke="${myColor}"
      stroke-width="4"
      stroke-dasharray="${perc}, 100"
    />`;
    soFar = soFar + perc;
  });

  // TODO: classnames
  let count = cluster.getChildCount();
  html += '<text x="18" y="21" text-anchor="middle" class="openstad-component-ideas-on-map-icon openstad-component-ideas-on-map-icon-text">' + count + '</text>';

  html += '</svg>';

  let className = 'osc-map-marker-cluster';
  if (isFaded) className += ' osc-map-marker-cluster-faded';

  return divIcon({ html: html, className, iconSize: point(36, 36), iconAnchor: [18, 18] });
}

function getCategory(marker: MarkerOptions & { data?: Record<string, unknown> }, categorizeByField: string) {
  if (!marker.data) return 'nocategoryfound';
  const categoryValue = marker.data[categorizeByField];
  return typeof categoryValue === 'string' ? categoryValue : 'nocategoryfound';
}
