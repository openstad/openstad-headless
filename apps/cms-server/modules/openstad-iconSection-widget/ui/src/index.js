export default () => {
  apos.util.widgetPlayers['openstad-iconSection'] = {
    selector: '[data-openstad-iconSection]',
    player: function (el) {
      console.log(el.dataset.expandablelabel);
      ApostropheWidgetsIconSection.IconSection.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};