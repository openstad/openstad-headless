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
    builders: {
      children: true,
      ancestors: {
        children: {
          depth: 2,
          relationships: false
        }
      }
    }
  },
};
