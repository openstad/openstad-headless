export default () => {
  apos.util.widgetPlayers['openstad-iconSection'] = {
    selector: '[data-openstad-iconSection]',
    player: function (el) {
      console.log(el.dataset.content)
      ApostropheWidgetsIconSection.IconSection.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};