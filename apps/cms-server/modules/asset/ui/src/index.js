export default () => {
  apos.util.onReady(() => {
    const globalOpenstadUserElement = document.getElementById(
      'global-openstad-user'
    );

    window.globalOpenStadUser = globalOpenstadUserElement
      ? { ...globalOpenstadUserElement.dataset }
      : null;

    const logoutDataElement = document.getElementById('logout-data');
    window.logoutUrl = logoutDataElement.getAttribute('data-logout-url');

    const nav = document.querySelector('#navbar');
    const footer = document.querySelector('#footer-container');

    document.addEventListener('navBarLoaded', adjustMenu);

    if (typeof nav !== 'undefined') {
      NavBar.NavBar.loadWidgetOnElement(nav, { ...nav.dataset });
    }

    if (typeof footer !== 'undefined') {
      Footer.Footer.loadWidgetOnElement(footer, { ...footer.dataset });
    }

    const allowCookieButton = document.querySelector('#allow-cookie-button');
    if (allowCookieButton) {
      allowCookieButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.setCookieConsent(true);
      });
    }

    const denyCookieButton = document.querySelector('#deny-cookie-button');
    if (denyCookieButton) {
      denyCookieButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.setCookieConsent(false);
      });
    }
  });
};
if (typeof window.process == 'undefined') {
  window.process = { env: { NODE_ENV: 'production' } };
}

window.setCookieConsent = function (allowCookies) {
  let date = new Date();
  document.cookie =
    'openstad-cookie-consent=' +
    (allowCookies ? '1' : '-1') +
    '; path=/; expires=Thu, 31 Dec ' +
    (date.getFullYear() + 5) +
    ' 23:59:00 UTC;';
  document.location.reload();
};

let isMobile = false;

function adjustMenu() {
  const mainContainer = document.querySelector('.main-header-container');
  const navContainer = document.querySelector('.header_navbar-container');
  const mainMenuContainer = document.querySelector('#main-menu');
  const logo = document.querySelector('.main-header-container .col-xs-12');
  const mobileThreshold = 1200;
  const closeButton = document.querySelector('.close-button');
  const closeButtonSpan = document.querySelector('.close-button span');
  const navbar = document.getElementById('navbar');
  const header = document.querySelector('.main-header-container');

  if (window.innerWidth <= mobileThreshold) {
    if (document.getElementsByClassName('--compact').length > 0) {
      if (
        navContainer.offsetWidth + logo.offsetWidth >=
        mainContainer.offsetWidth
      ) {
        navContainer.classList.add('--mobile');
        isMobile = true;
      } else if (!isMobile) {
        navContainer.classList.remove('--mobile');
      }
    } else {
      if (mainMenuContainer.offsetWidth >= mainContainer.offsetWidth) {
        navbar.classList.add('--hidden');
        navContainer.classList.add('--mobile');
        isMobile = true;
      } else if (!isMobile) {
        navbar.classList.remove('--hidden');
        navContainer.classList.remove('--mobile');
      }
    }
  } else {
    navContainer.classList.remove('--mobile');
    navbar.classList.remove('--hidden');
    isMobile = false;
  }

  closeButton.setAttribute('aria-controls', 'main-menu');
  closeButton.setAttribute('aria-expanded', 'false');
  mainMenuContainer.setAttribute('aria-hidden', 'true');

  closeButton.replaceWith(closeButton.cloneNode(true));
  const newCloseButton = document.querySelector('.close-button');

  newCloseButton.addEventListener('click', () => {
    const isExpanded = newCloseButton.getAttribute('aria-expanded') === 'true';
    newCloseButton.setAttribute('aria-expanded', !isExpanded);
    mainMenuContainer.setAttribute('aria-hidden', isExpanded);

    navContainer.classList.toggle('--show');
    closeButtonSpan.textContent = isExpanded ? 'Menu tonen' : 'Menu verbergen';

    if (!isExpanded) {
      trapFocus(navContainer);
    }
  });

  navbar.addEventListener('focusout', (event) => {
    if (
      !navbar.contains(event.relatedTarget) &&
      !header.contains(event.relatedTarget)
    ) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  header.addEventListener('focusin', () => {
    // Do nothing, just to ensure focus is detected
  });
}

window.onresize = adjustMenu;
