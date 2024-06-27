export default () => {
  apos.util.widgetPlayers['openstad-shareLinks'] = {
    selector: '[data-openstad-sharelinks]',
    player: function (el) {
      ApostropheWidgetsShareLinks.ShareLinks.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};
