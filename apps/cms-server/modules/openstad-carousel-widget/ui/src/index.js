export default () => {
  apos.util.widgetPlayers['openstad-carousel'] = {
    selector: '[data-openstad-carousel]',
    player: function (el) {
      if (window.ApostropheWidgetsCarousel) {
        ApostropheWidgetsCarousel.Carousel.loadWidgetOnElement(el, {
          ...el.dataset,
        });
        return;
      }
      window
        .loadWidgetAssets(
          '/widget-assets/carousel.iife.js',
          '/widget-assets/carousel.css'
        )
        .then(() => {
          ApostropheWidgetsCarousel.Carousel.loadWidgetOnElement(el, {
            ...el.dataset,
          });
        })
        .catch((err) => {
          console.error('Failed to load carousel widget:', err);
        });
    },
  };
};
