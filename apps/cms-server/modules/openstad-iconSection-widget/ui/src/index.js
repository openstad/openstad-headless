export default () => {
  apos.util.widgetPlayers['openstad-iconSection'] = {
    selector: '[data-openstad-iconSection]',
    player: function (el) {
      if (window.ApostropheWidgetsIconSection) {
        ApostropheWidgetsIconSection.IconSection.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/icon-section.iife.js',
          '/widget-assets/icon-section.css'
        )
        .then(() => {
          ApostropheWidgetsIconSection.IconSection.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load icon-section widget:', err);
        });
    },
  };
};
