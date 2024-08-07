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
        document.getElementById('navbar').classList.add('--hidden');
        navContainer.appendChild(
          document.getElementById('navbar').cloneNode(true)
        );
        navContainer.classList.add('--mobile');
        isMobile = true;
      } else if (!isMobile) {
        document.getElementById('navbar').classList.remove('--hidden');
        navContainer.classList.remove('--mobile');
      }
    }
  } else {
    // Remove mobile class when screen size gets larger
    navContainer.classList.remove('--mobile');
    document.getElementById('navbar').classList.remove('--hidden');
    isMobile = false;
  }

  document.querySelector('.close-button').addEventListener('click', () => {
    document
      .querySelector('.header_navbar-container')
      .classList.toggle('--show');
  });
}

window.onload = adjustMenu;
window.onresize = adjustMenu;