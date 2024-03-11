export default () => {
  apos.util.onReady(() => {
    const el = document.querySelector('#navbar');
    
    if (typeof el !== 'undefined') {
      NavBar.NavBar.loadWidgetOnElement(el, { ...el.dataset });
    }
  });
};
