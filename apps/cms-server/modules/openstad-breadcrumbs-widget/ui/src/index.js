import '../../views/widget.scss';

export default () => {
  apos.util.widgetPlayers['openstad-breadcrumbs'] = {
    selector: '.breadcrumbs-container',
    player: function (el) {
      renderBreadcrumbs(el);
    },
  };
};

function formatLabel(segment) {
  return decodeURIComponent(segment)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function createBreadcrumbItem({ label, href, isCurrent }) {
  const li = document.createElement('li');
  if (isCurrent) {
    const span = document.createElement('span');
    span.textContent = label;
    span.setAttribute('aria-current', 'page');
    span.classList.add('utrecht-link');
    span.classList.add('utrecht-link--html-a');
    li.appendChild(span);
  } else {
    const a = document.createElement('a');
    a.textContent = label;
    a.setAttribute('href', href);
    a.classList.add('utrecht-link');
    a.classList.add('utrecht-link--html-a');
    li.appendChild(a);
  }
  return li;
}

function removeTrailingSlash(url) {
    return typeof url === 'string' && url.endsWith('/') ? url.slice(0, -1) : url;
}

function renderBreadcrumbs(container) {
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.className = 'breadcrumb-nav';

  const ol = document.createElement('ol');

  const homeUrl = removeTrailingSlash(container?.getAttribute('data-homeUrl')) || null;

  const homeOrigin = window.location.origin;
  const homePageIsWithSubdomain = homeUrl !== homeOrigin;
  const currentUrl = removeTrailingSlash(window.location.origin + window.location.pathname);

  const isHomepage = homeUrl === currentUrl;
  ol.appendChild(
    createBreadcrumbItem({
      label: 'Homepage',
      href: homeUrl || '/',
      isCurrent: isHomepage,
    })
  );

  let cumulative = homeUrl;
  pathParts.forEach((part, idx) => {
    if (idx === 0 && homePageIsWithSubdomain) {
      // If the homepage includes a subdomain, the first path part is already represented by the homepage link
      return;
    }

    cumulative += '/' + part;
    ol.appendChild(
      createBreadcrumbItem({
        label: formatLabel(part),
        href: cumulative,
        isCurrent: idx === pathParts.length - 1,
      })
    );
  });

  nav.appendChild(ol);

  if (container && container.appendChild) container.appendChild(nav);
  return nav;
}
