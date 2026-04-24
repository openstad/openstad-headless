export default () => {
  apos.util.widgetPlayers['openstad-title'] = {
    selector: '[data-openstad-title]',
    player: function (el) {
      if (window.ApostropheWidgetsHeading) {
        ApostropheWidgetsHeading.Heading.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/heading.iife.js',
          '/widget-assets/heading.css'
        )
        .then(() => {
          ApostropheWidgetsHeading.Heading.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load heading widget:', err);
        });
    },
  };
};
