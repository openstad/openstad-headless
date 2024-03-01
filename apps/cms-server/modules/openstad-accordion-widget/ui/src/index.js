export default () => {
  apos.util.widgetPlayers['openstad-accordion'] = {
    selector: '[data-openstad-accordion]',
    player: function (el) {
      console.log(el.dataset.content)
      ApostropheWidgetsAccordion.Accordion.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};