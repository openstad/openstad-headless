export default () => {
  apos.util.widgetPlayers.collapser = {
    selector: '[data-openstad-component-url]',
    player: function (el) {
      const url = el.dataset.openstadComponentUrl || '';
      
      if (url) {
        const script = document.createElement('script');
        script.src = url;
        el.appendChild(script);
      }
    }
  };
};
