type InitContainer = (id: string | HTMLElement) => void;
type ReusableContainer = HTMLElement & { _leaflet_id?: number };

let containerReuseAllowed = false;

function allowContainerReuse(L: typeof import('leaflet')) {
  if (containerReuseAllowed) return;
  containerReuseAllowed = true;

  const proto = L.Map.prototype as unknown as {
    _initContainer: InitContainer;
  };
  const initContainer = proto._initContainer;
  proto._initContainer = function (id) {
    const container = (
      typeof id === 'string' ? document.getElementById(id) : id
    ) as ReusableContainer | null;
    if (container && container._leaflet_id) {
      container._leaflet_id = undefined;
    }
    return initContainer.call(this, id);
  };
}

export async function loadReactLeaflet() {
  const L = await import('leaflet');
  allowContainerReuse(L);
  return import('react-leaflet');
}
