// TODO: Onderstaande code zou ervoor moeten zorgen dat de toolbar in de rich-text editor werkt, maar dat doet het niet.
//  Door de code uit te zetten werkt de toolbar wel in de modal. Het lijkt mij wel wenselijk dat je ook buiten de modal de toolbar kan gebruiken.

// const contentWidgets = {
//   '@apostrophecms/rich-text': {
//     toolbar: [
//       'styles',
//       '|',
//       'bold',
//       'italic',
//       'strike',
//       'link',
//       '|',
//       'bulletList',
//       'orderedList'
//     ],
//     styles: [
//       {
//         tag: 'p',
//         label: 'Paragraph (P)',
//       },
//       {
//         tag: 'h1',
//         label: 'Heading 1 (H1)',
//       },
//       {
//         tag: 'h2',
//         label: 'Heading 2 (H2)',
//       },
//       {
//         tag: 'h3',
//         label: 'Heading 3 (H3)',
//       },
//       {
//         tag: 'h4',
//         label: 'Heading 4 (H4)',
//       }
//     ]
//   }
// };

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Rich Text Editor',
  },
  fields: {
    add: {
      text: {
        type: 'area',
        options: {

          // TODO: De todo van boven heeft deze code nodig
          // widgets: contentWidgets,

          widgets: {
            '@apostrophecms/rich-text': {}
          }
        },
        max: 1
      },
    },
  },
};
