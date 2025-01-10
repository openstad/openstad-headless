export default () => {
  apos.util.widgetPlayers['openstad-section'] = {
    selector: '[data-openstad-section]',
    player: function (el) {
      // Check if el has a background-image in the dataset
      if (el.dataset['background-image']) {
        el.style.backgroundImage = `url(${el.dataset['background-image']})`;
      }
    }
  };
};
