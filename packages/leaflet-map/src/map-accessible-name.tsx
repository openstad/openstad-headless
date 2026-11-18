import { useEffect } from 'react';
// @ts-ignore
import { useMap } from 'react-leaflet/hooks';

// Leaflet makes its own container focusable (tabindex=0), so the accessible
// name must be on that element, not on a wrapper around it. Otherwise keyboard
// focus lands on an element without a name (WCAG 4.1.2).
export function MapAccessibleName({
  label,
  describedBy,
}: {
  label: string;
  describedBy: string;
}) {
  const map = useMap();

  useEffect(() => {
    const el = map.getContainer();
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', label);
    el.setAttribute('aria-describedby', describedBy);
  }, [map, label, describedBy]);

  return null;
}

export default MapAccessibleName;
