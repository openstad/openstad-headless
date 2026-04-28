export default () => {
  apos.util.widgetPlayers['openstad-button'] = {
    selector: '[data-openstad-button]',
    player: function (el) {
      if (window.ApostropheWidgetsButton) {
        ApostropheWidgetsButton.Button.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/button.iife.js',
          '/widget-assets/button.css'
        )
        .then(() => {
          ApostropheWidgetsButton.Button.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load button widget:', err);
        });
    },
  };
};
