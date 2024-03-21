export default () => {
  apos.util.widgetPlayers['openstad-sharelinks'] = {
    selector: '[data-openstad-sharelinks]',
    player: function (el) {
      ApostropheWidgetsShareLinks.ShareLinks.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};