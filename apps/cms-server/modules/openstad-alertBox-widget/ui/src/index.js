export default () => {
  apos.util.widgetPlayers['openstad-alertbox'] = {
    selector: '[data-openstad-alertbox]',
    player: function (el) {
      ApostropheWidgetsAlertBox.AlertBox.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};