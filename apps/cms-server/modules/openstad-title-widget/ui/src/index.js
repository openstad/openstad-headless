export default () => {
  apos.util.widgetPlayers['openstad-title'] = {
    selector: '[data-openstad-title]',
    player: function (el) {
      ApostropheWidgetsHeading.Heading.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};