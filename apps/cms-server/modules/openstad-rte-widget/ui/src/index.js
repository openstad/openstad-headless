export default () => {
  apos.util.widgetPlayers['openstad-rte'] = {
    selector: '[data-openstad-rte]',
    player: function (el) {
      if (window.ApostropheWidgetsRTE) {
        ApostropheWidgetsRTE.RTE.loadWidgetOnElement(el, { ...el.dataset });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/rte.iife.js',
          '/widget-assets/rte.css'
        )
        .then(() => {
          ApostropheWidgetsRTE.RTE.loadWidgetOnElement(el, { ...el.dataset });
        })
        .catch((err) => {
          console.error('Failed to load rte widget:', err);
        });
    },
  };
};
