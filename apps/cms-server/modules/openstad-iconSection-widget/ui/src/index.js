export default () => {
  apos.util.widgetPlayers['openstad-iconSection'] = {
    selector: '[data-openstad-iconSection]',
    player: function (el) {
      ApostropheWidgetsIconSection.IconSection.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};