export default () => {
  apos.util.widgetPlayers['openstad-button'] = {
    selector: '[data-openstad-button]',
    player: function (el) {
      console.log(el.dataset.buttons)
      ApostropheWidgetsButton.Button.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};