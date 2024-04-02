import type { LeafletMouseEvent } from 'leaflet';
import { Marker as LeafletMarker, useMap } from 'react-leaflet';
import type { MarkerProps } from './types/marker-props';
import { addToClassname, removeFromClassName } from '../../lib/class-name.js';
import MarkerIcon from './marker-icon';

export default function Marker({
  lat = undefined,
  lng = undefined,
  isFaded = false,
  isVisible = true,
  icon = undefined,
  iconCreateFunction = undefined,
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
    addToClassname(icon, 'osc-map-marker', { before: true });
    isFaded
      ? addToClassname(icon, 'osc-map-marker-faded')
      : removeFromClassName(icon, 'osc-map-marker-faded');
  }

  const divIcon = MarkerIcon({ ...icon, iconCreateFunction });

  let eventHandlers: {
    [eventname: string]: (e: LeafletMouseEvent) => void;
  } = {};

  for (let eventname of [
    'click',
    'mouseDown',
    'mouseUp',
    'dragStart',
    'dragEnd',
  ]) {
    let EventName =
      'on' + eventname.charAt(0).toUpperCase() + eventname.slice(1);
    eventname = eventname.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    let onEvent = (props as any)[EventName] || [];
    if (!Array.isArray(onEvent)) onEvent = [onEvent];

    if (EventName === 'onClick' && href) {
      onEvent.push(() => {
        document.location.href = href;
      });
    }

    if (onEvent.length) {
      eventHandlers[eventname] = (e: LeafletMouseEvent) => {
        onEvent.forEach((func: (e: LeafletMouseEvent, map: any) => void) => {
          let customEvent = new CustomEvent('osc-map-marker-click', {
            detail: e,
          });
          window.dispatchEvent(customEvent);
          if (typeof func === 'string') return eval(func)(e);
          func(e, map);
        });
      };
    }
  }

  let draggable = eventHandlers['dragstart'] || eventHandlers['dragend'];

  return isVisible && typeof lat === 'number' && typeof lng === 'number' ? (
    <LeafletMarker
      {...props}
      draggable={!!draggable}
      eventHandlers={eventHandlers}
      icon={divIcon}
      position={[lat, lng]}
    />
  ) : null;
}
