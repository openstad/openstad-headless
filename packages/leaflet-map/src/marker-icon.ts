import { Icon as LeafletIcon, divIcon as LeafletDivIcon } from 'leaflet';
import type { MarkerIconType } from './types/marker-icon';

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
    let iconOptions = icon.options || icon;

    try {
      iconOptions = JSON.parse(iconOptions as string);
    } catch (err) {
      // Het icoon is geen JSON, ga verder met de huidige waarde
    }

    if (!iconOptions.iconSize && iconOptions.width && iconOptions.height) {
      iconOptions.iconSize = [iconOptions.width, iconOptions.height];
    }
    if (!iconOptions.iconAnchor && iconOptions.anchor) {
      iconOptions.iconAnchor = iconOptions.anchor;
    }

    if (iconOptions.iconUrl) {
      result = new LeafletIcon(iconOptions);
    } else if (iconOptions.html) {
      result = LeafletDivIcon(iconOptions);
    }
  }

  if (!result) {
    let title = icon?.title || 'Locatie pin';
    let color = icon?.color || '#555588';
    let html = `<?xml version="1.0" encoding="UTF-8"?><svg width="29" height="40" viewBox="0 0 39 50" fill="none" xmlns="http://www.w3.org/2000/svg"> <title>${title}</title><path d="M19.1038 0C29.6577 0 38.2075 8.46671 38.2075 18.9181C38.2075 33.1786 21.7544 47.7273 21.0432 48.3035L19.1038 50L17.1643 48.3035C16.4532 47.7273 0 33.1786 0 18.9181C0 8.46831 8.54983 0 19.1038 0ZM32.3245 18.9181C32.3083 11.6837 26.4091 5.84187 19.1038 5.82586C11.7984 5.84187 5.89922 11.6837 5.88306 18.9181C5.88306 27.3367 14.1581 37.2439 19.0876 42.1095C23.1767 38.1242 32.3245 27.993 32.3245 18.9181Z" fill="${color}"></path><path d="M19.104 5.82568C26.4093 5.84169 32.3086 11.6836 32.3247 18.9179C32.3247 27.9928 23.1769 38.124 19.0879 42.1093C14.1584 37.2437 5.8833 27.3366 5.8833 18.9179C5.89946 11.6836 11.7987 5.84169 19.104 5.82568ZM25.5689 18.9179C25.5689 15.3807 22.6759 12.5158 19.104 12.5158C15.5322 12.5158 12.6391 15.3807 12.6391 18.9179C12.6391 22.455 15.5322 25.3199 19.104 25.3199C22.6759 25.3199 25.5689 22.455 25.5689 18.9179Z" fill="white"></path><path d="M19.1038 25.3202C22.6743 25.3202 25.5687 22.4539 25.5687 18.9182C25.5687 15.3824 22.6743 12.5161 19.1038 12.5161C15.5333 12.5161 12.6389 15.3824 12.6389 18.9182C12.6389 22.4539 15.5333 25.3202 19.1038 25.3202Z" fill="${color}"></path></svg>`;
    result = LeafletDivIcon({
      html,
      className: icon?.className,
      iconSize : [34,45],
      iconAnchor : [17,45],
    });
  }

  return result;
  
}
