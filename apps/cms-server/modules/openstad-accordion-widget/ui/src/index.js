export default () => {
  apos.util.widgetPlayers['openstad-accordion'] = {
    selector: '[data-openstad-accordion]',
    player: function (el) {
      if (window.ApostropheWidgetsAccordion) {
        ApostropheWidgetsAccordion.Accordion.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/accordion.iife.js',
          '/widget-assets/accordion.css'
        )
        .then(() => {
          ApostropheWidgetsAccordion.Accordion.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load accordion widget:', err);
        });
    },
  };
};
