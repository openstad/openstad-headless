import { MarkerOptions, divIcon, point } from 'leaflet';
import type { MarkerCluster } from 'leaflet';

import { sanitizeColor } from './sanitize';

const DEFAULT_CLUSTER_COLOR = '#164995';

export default function amapsCreateClusterIcon(
  cluster: MarkerCluster,
  categorize = {
    categorizeByField: 'nocategorization',
    categories: {},
  }
) {
  let clusterMarkers = cluster.getAllChildMarkers();

  let colors: { [key: string]: number } = {};
  let defaultCount = 0;
  let total = clusterMarkers.length;
  let isFaded = true;
  clusterMarkers.forEach((clusterMarker) => {
    let marker = clusterMarker.options as MarkerOptions & {
      data?: Record<string, unknown>;
    };
    if (!marker) return console.log('Marker not found:', clusterMarker);
    let category = getCategory(marker, categorize.categorizeByField);
    if (
      typeof category === 'string' &&
      categorize.categories.hasOwnProperty(category)
    ) {
      const color = (
        categorize.categories[
          category as keyof typeof categorize.categories
        ] as { color: string }
      ).color;
      if (!colors[color]) colors[color] = 0;
      colors[color]++;
    } else {
      defaultCount++;
    }
    if (!(marker && 'isFaded' in marker && marker?.isFaded)) isFaded = false;
  });

  let html =
    '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="14" fill="white"/>';

  const segments = Object.keys(colors).map((key) => ({
    count: colors[key],
    stroke: sanitizeColor(key),
    className: 'osc-map-marker-cluster-segment',
  }));
  if (defaultCount > 0) {
    segments.push({
      count: defaultCount,
      stroke: DEFAULT_CLUSTER_COLOR,
      className:
        'osc-map-marker-cluster-segment osc-map-marker-cluster-segment-default',
    });
  }

  let soFar = 0;
  segments.forEach(({ count, stroke, className }) => {
    let perc = (100 * count) / total;
    let angle = (soFar / 100) * 360;

    html += `    <path
      class="${className}"
      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      fill="none"
      transform="rotate(${angle}, 18, 18)"
      stroke="${stroke}"
      stroke-width="4"
      stroke-dasharray="${perc}, 100"
    />`;
    soFar = soFar + perc;
  });

  // TODO: classnames
  let count = cluster.getChildCount();
  html +=
    '<text x="18" y="21" text-anchor="middle" class="osc-map-marker-cluster-count openstad-component-ideas-on-map-icon openstad-component-ideas-on-map-icon-text">' +
    count +
    '</text>';

  html += '</svg>';
  html += `<span class="sr-only">${count} locaties gegroepeerd, druk op Enter om in te zoomen</span>`;

  let className = 'osc-map-marker-cluster';
  if (isFaded) className += ' osc-map-marker-cluster-faded';

  return divIcon({
    html: html,
    className,
    iconSize: point(36, 36),
    iconAnchor: [18, 18],
  });
}

function getCategory(
  marker: MarkerOptions & { data?: Record<string, unknown> },
  categorizeByField: string
) {
  if (!marker.data) return 'nocategoryfound';
  const categoryValue = marker.data[categorizeByField];
  return typeof categoryValue === 'string' ? categoryValue : 'nocategoryfound';
}
