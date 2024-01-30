import type { LeafletMouseEvent } from 'leaflet';
import { Marker as LeafletMarker, useMap } from 'react-leaflet'
import type { MarkerProps } from './types/marker-props';
import { addToClassname, removeFromClassName } from '../../lib/class-name.js';
import MarkerIcon from './marker-icon';

export default function Marker({
  location = undefined,
	lat = undefined,
	lng = undefined,
  isFaded = false,
  isVisible = true,
  icon = undefined,
  iconCreateFunction = undefined,
  defaultIcon = undefined,
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
  if (icon) {
    try {
      icon = JSON.parse(icon as string)
    } catch(err) {}
    addToClassname(icon, 'osc-map-marker', { before: true })
    isFaded ? addToClassname(icon, 'osc-map-marker-faded') : removeFromClassName(icon, 'osc-map-marker-faded');
  }
  icon = MarkerIcon({ icon, iconCreateFunction, defaultIcon });

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
    draggable={!!draggable}
    eventHandlers={eventHandlers}
    icon={icon}
    position={location ? [ location.lat, location.lng ] : [ lat, lng ]}
    />
  ) : null;
  
}

