export default () => {
  apos.util.onReady(() => {
    const nav = document.querySelector('#navbar');
    const footer = document.querySelector('#footer-container');

    if (typeof nav !== 'undefined') {
      NavBar.NavBar.loadWidgetOnElement(nav, { ...nav.dataset });
    }

    if (typeof footer !== 'undefined') {
      Footer.Footer.loadWidgetOnElement(footer, { ...footer.dataset });
    }
  });
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

  function closeMenu() {
    closeButton.setAttribute('aria-expanded', 'false');
    mainMenuContainer.setAttribute('aria-hidden', 'true');
    navContainer.classList.remove('--show');
    closeButtonSpan.textContent = 'Menu tonen';
  }

  closeButton.addEventListener('click', () => {
    const isExpanded = closeButton.getAttribute('aria-expanded') === 'true';
    closeButton.setAttribute('aria-expanded', !isExpanded);
    mainMenuContainer.setAttribute('aria-hidden', isExpanded);

    navContainer.classList.toggle('--show');
    closeButtonSpan.textContent = isExpanded ? 'Menu tonen' : 'Menu verbergen';
  });

  navbar.addEventListener('focusout', (event) => {
    if (!navbar.contains(event.relatedTarget) && !header.contains(event.relatedTarget)) {
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

window.onload = adjustMenu;
window.onresize = adjustMenu;

window.onload = adjustMenu;
window.onresize = adjustMenu;
