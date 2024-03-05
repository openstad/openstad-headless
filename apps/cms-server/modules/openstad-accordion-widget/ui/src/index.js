export default () => {
  apos.util.widgetPlayers['openstad-accordion'] = {
    selector: '[data-openstad-accordion]',
    player: function (el) {
      ApostropheWidgetsAccordion.Accordion.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};