import { Icon, divIcon, LeafletMouseEvent } from 'leaflet';
import { addToClassname, removeFromClassName } from '../../lib/class-name.js';
import { Marker as LeafletMarker, useMap } from 'react-leaflet'
import { MarkerProps } from './types/marker-props';

export default function Marker({
  location = undefined,
	lat = undefined,
	lng = undefined,
  isFaded = false,
  isVisible = true,
  icon = {
    iconUrl : '/img/marker-icon.svg',
    shadowUrl : '/img/marker-shadow.png',
    iconSize : [32,40],
    iconAnchor : [8,40],
  },
  iconCreateFunction = null,
  href = undefined,
  onClick = undefined,
  onMouseDown = undefined,
  onMouseUp = undefined,
  onDragStart = undefined,
  onDragEnd = undefined,
  ...props
}: MarkerProps) {

  const map = useMap();

  // icon
	if (!icon) {
		if (iconCreateFunction && typeof iconCreateFunction == 'string') {
			iconCreateFunction = eval(iconCreateFunction);
		}
		if (iconCreateFunction && typeof iconCreateFunction == 'function') {
			icon = iconCreateFunction();
		}
	}
  if (icon) {
    try {
      icon = JSON.parse(icon as string);
    } catch(err) {}

    if (!icon.iconSize && icon.width && icon.height) icon.iconSize = [icon.width, icon.height]
    if (!icon.iconAnchor && icon.anchor) icon.iconAnchor = icon.anchor

    addToClassname(icon, 'osc-map-marker', { before: true })
    isFaded ? addToClassname(icon, 'osc-map-marker-faded') : removeFromClassName(icon, 'osc-map-marker-faded');
    if (icon.iconUrl) icon = new Icon(icon);
    if (icon.html) icon = divIcon(icon);
  }

  // events
  let eventHandlers = {};
  for (let eventname of ['click', 'mouseDown', 'mouseUp', 'dragStart', 'dragEnd']) {
    let EventName = 'on' + eventname.charAt(0).toUpperCase() + eventname.slice(1);;
    eventname = eventname.toLowerCase();
    let onEvent = eval(EventName) || [];
    if (!Array.isArray(onEvent)) onEvent = [onEvent];
		if (EventName == 'onClick' && href) {
		  onEvent.push(function() {
		    document.location.href = href;
		  });
		}
    if (onEvent.length) {
      eventHandlers[eventname] = (e: LeafletMouseEvent) => {
        onEvent.map((func: (e: LeafletMouseEvent, map: any) => void) => {
		      let customEvent = new CustomEvent('osc-map-marker-click', { detail: e });
		      window.dispatchEvent(customEvent);
			    if (typeof func == 'string') return eval(func)(e);
          return func(e, map);
        })
      }
		}
  }

  let draggable = eventHandlers['dragstart'] || eventHandlers['dragend'];
  
  return isVisible && ( location?.lat || lat ) ? (
    <LeafletMarker
    {...props}
    position={location ? [ location.lat, location.lng ] : [ lat, lng ]}
    icon={icon}
    draggable={!!draggable}
    eventHandlers={eventHandlers}
    />
  ) : null;
  
}
