export default () => {
  apos.util.widgetPlayers['openstad-breadcrumbs'] = {
    selector: '.breadcrumbs-container',
    player: function (el) {
      renderBreadcrumbs(el);
    },
  };
  import('../../views/widget.scss');
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

function renderBreadcrumbs(container) {
  const pathParts = window.location.pathname.split('/').filter(Boolean);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.className = 'breadcrumb-nav';

  const ol = document.createElement('ol');

  const isHomepage = pathParts.length === 0;
  ol.appendChild(
    createBreadcrumbItem({
      label: 'Homepage',
      href: '/',
      isCurrent: isHomepage,
    })
  );

  let cumulative = '';
  pathParts.forEach((part, idx) => {
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
