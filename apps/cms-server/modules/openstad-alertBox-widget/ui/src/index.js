export default () => {
  apos.util.widgetPlayers['openstad-alertBox'] = {
    selector: '[data-openstad-alertbox]',
    player: function (el) {
      if (window.ApostropheWidgetsAlertBox) {
        ApostropheWidgetsAlertBox.AlertBox.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/alert-box.iife.js',
          '/widget-assets/alert-box.css'
        )
        .then(() => {
          ApostropheWidgetsAlertBox.AlertBox.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load alert-box widget:', err);
        });
    },
  };
};
