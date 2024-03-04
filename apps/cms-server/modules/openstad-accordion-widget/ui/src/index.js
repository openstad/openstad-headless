export default () => {
  apos.util.widgetPlayers['openstad-accordion'] = {
    selector: '[data-openstad-accordion]',
    player: function (el) {
      console.log(el.dataset.text)
      ApostropheWidgetsAccordion.Accordion.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};