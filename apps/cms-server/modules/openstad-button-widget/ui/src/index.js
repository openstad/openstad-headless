export default () => {
  apos.util.widgetPlayers['openstad-button'] = {
    selector: '[data-openstad-button]',
    player: function (el) {
      ApostropheWidgetsButton.Button.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};