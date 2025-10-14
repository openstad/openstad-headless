// Import the widget CSS
import '../../views/widget.scss';

export default () => {
  apos.util.widgetPlayers['openstad-blog-post'] = {
    selector: '[data-openstad-blog-post]',
    player: function (el) {
      ApostropheWidgetsBlogPost.BlogPost.loadWidgetOnElement(el, { ...el.dataset });
    }
  };
};
