import { loadOpenStadComponents, OpenStadComponents } from './openstad-components';

export default () => {
  apos.util.widgetPlayers.ideasOnMap = {
    selector: '.osc-idea-map-container',
    player: function (el) {
      const cdn = el.dataset.cdn;
      
      loadOpenStadComponents(
        'ideas-on-map',
        function () {
          let config;

          try {
            config = JSON.parse(el.dataset.config)
          } catch (err) { }

          window.OpenStadComponents['ideas-on-map'].IdeasOnMap.renderElement(el, config);
        },
        cdn
      );
    }
  };
}