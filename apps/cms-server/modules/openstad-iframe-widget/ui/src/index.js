import '../../views/widget.scss';

export default () => {
  apos.util.widgetPlayers['openstad-iframe'] = {
    selector: '[data-openstad-iframe]',
    player(el) {
      window.addEventListener('message', (event) => {
        // Only accept messages coming from this widget's own iframe
        if (event.source !== el.contentWindow) return;
        const height = Number(event.data && event.data.iframeHeight);
        if (Number.isFinite(height) && height > 0) {
          el.style.height = `${height}px`;
        }
      });
    },
  };
};
