// This configures the @apostrophecms/pages module to add a "home" page type to the
// pages menu

module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Standaard pagina',
      },
      {
        name: '@apostrophecms/home-page',
        label: 'Home pagina',
      },
      {
        name: '@apostrophecms/blog-page',
        label: 'Blog page',
      },
    ],
  },
  handlers(self){
    return {
      'apostrophe:afterInit': async (req, piece) => {
        console.log ('<===> apos after init', req, piece)
      }
    }
  }
};
