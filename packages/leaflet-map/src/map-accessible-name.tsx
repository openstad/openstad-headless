import { useEffect } from 'react';
// @ts-ignore
import { useMap } from 'react-leaflet/hooks';

// ponytail: Leaflet maakt zijn eigen container focusbaar (tabindex=0), dus de
// toegankelijke naam moet op dát element staan, niet op een wrapper eromheen —
// anders landt de toetsenbordfocus op een element zonder naam (WCAG 4.1.2).
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
