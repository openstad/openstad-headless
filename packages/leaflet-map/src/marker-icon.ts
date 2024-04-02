import { Icon as LeafletIcon, divIcon as LeafletDivIcon, DivIcon } from 'leaflet';
import type { MarkerIconType } from './types/marker-icon';

export default function MarkerIcon({
  iconCreateFunction = undefined,
  ...icon
}: MarkerIconType) {
  let result: DivIcon;

  if (!icon) {
    if (iconCreateFunction && typeof iconCreateFunction == 'string') {
      iconCreateFunction = eval(iconCreateFunction);
    }
    if (iconCreateFunction && typeof iconCreateFunction == 'function') {
      icon = iconCreateFunction();
    }
  }

  // todo: afvangen of icon en defaultIcon nu al een LeafletIcon of LeafletDivIcon zijn

  if (!icon.html) {
    let color = icon?.color || '#EC0000';
    icon.html = `<?xml version="1.0" encoding="UTF-8"?><svg width="34px" height="45px" viewBox="0 0 34 45" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z" id="Path" fill="${color}" fill-rule="nonzero"></path></svg>`;
    result = LeafletDivIcon(icon);
  } else {
    result = LeafletDivIcon(icon);
  }

  return result;
}
