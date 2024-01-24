import { Icon as LeafletIcon, divIcon as LeafletDivIcon } from 'leaflet';
import { MarkerIconType } from './types/marker-icon';

export default function MarkerIcon({
  icon = undefined,
  iconCreateFunction = undefined,
  defaultIcon = undefined,
}: MarkerIconType) {

  let result: any; // TODO

	if (!icon) {
		if (iconCreateFunction && typeof iconCreateFunction == 'string') {
			iconCreateFunction = eval(iconCreateFunction);
		}
		if (iconCreateFunction && typeof iconCreateFunction == 'function') {
			icon = iconCreateFunction();
		}
	}

  // todo: afvangen of icon en defaultIcon nu al een LeafletIcon of LeafletDivIcon zijn

  if (!icon) icon = defaultIcon;
  
  if (icon) {

    try {
      icon = JSON.parse(icon as string);
    } catch(err) {}

    if (!icon.iconSize && icon.width && icon.height) icon.iconSize = [icon.width, icon.height]
    if (!icon.iconAnchor && icon.anchor) icon.iconAnchor = icon.anchor;

    if (icon.iconUrl) result = new LeafletIcon(icon);
    if (icon.html) result = LeafletDivIcon(icon);

  }

  if (!result) {
    let color = icon?.color || '#EC0000';
    let html = `<?xml version="1.0" encoding="UTF-8"?><svg width="34px" height="45px" viewBox="0 0 34 45" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z" id="Path" fill="${color}" fill-rule="nonzero"></path></svg>`;
    result = LeafletDivIcon({
      html,
      className: icon?.className,
      iconSize : [34,45],
      iconAnchor : [17,45],
    });
  }

  return result;
  
}
