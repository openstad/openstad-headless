export default () => {
  apos.util.widgetPlayers['openstad-alertBox'] = {
    selector: '[data-openstad-alertbox]',
    player: function (el) {
      ApostropheWidgetsAlertBox.AlertBox.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};
