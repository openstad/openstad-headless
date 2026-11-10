type LeafletModule = typeof import('leaflet');

const PATCHED = Symbol.for('openstad.leafletContainerReuse');

export function allowLeafletContainerReuse(L: LeafletModule) {
  const proto = L.Map.prototype as any;
  if (proto[PATCHED]) return;

  const originalInitContainer = proto._initContainer;
  proto._initContainer = function (id: any) {
    const container = typeof id === 'string' ? document.getElementById(id) : id;
    if (container && container._leaflet_id) {
      L.DomEvent.off(container);
      container.innerHTML = '';
      container._leaflet_id = undefined;
    }
    return originalInitContainer.call(this, id);
  };
  proto[PATCHED] = true;
}
