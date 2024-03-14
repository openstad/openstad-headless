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
