export default () => {
  apos.util.widgetPlayers['openstad-carousel'] = {
    selector: '[data-openstad-carousel]',
    player: function (el) {
      ApostropheWidgetsCarousel.Carousel.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};
