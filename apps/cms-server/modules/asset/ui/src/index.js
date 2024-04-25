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

// Make mobile menu
window.onload = function () {
  if (document.getElementsByClassName('--compact').length > 0) {
    const mainContainer = document.querySelector('.main-header-container');
    const navContainer = document.querySelector('.header_navbar-container');
    const logo = document.querySelector('.main-header-container .col-xs-12');

    if (
      navContainer.offsetWidth + logo.offsetWidth >=
      mainContainer.offsetWidth
    ) {
      navContainer.classList.add('--mobile');
    } else {
      navContainer.classList.remove('--mobile');
    }
  }

  document.querySelector('.close-button').addEventListener('click', () => {
    document
      .querySelector('.header_navbar-container')
      .classList.toggle('--show');
  });
};
