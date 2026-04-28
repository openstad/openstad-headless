export default () => {
  apos.util.widgetPlayers['openstad-shareLinks'] = {
    selector: '[data-openstad-sharelinks]',
    player: function (el) {
      if (window.ApostropheWidgetsShareLinks) {
        ApostropheWidgetsShareLinks.ShareLinks.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/share-link.iife.js',
          '/widget-assets/share-link.css'
        )
        .then(() => {
          ApostropheWidgetsShareLinks.ShareLinks.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load share-link widget:', err);
        });
    },
  };
};
