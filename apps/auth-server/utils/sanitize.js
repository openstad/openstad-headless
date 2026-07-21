var sanitize = require('sanitize-html');

var remoteURL = /^(?:\/\/)|(?:\w+?:\/{0,2})/;
var noTags = {
  allowedTags: [],
  allowedAttributes: [],
};
var allSafeTags = {
  allowedTags: [
    // Content sectioning
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'nav',
    'section',
    // Text content
    'center',
    'dd',
    'div',
    'dl',
    'dt',
    'figcaption',
    'figure',
    'hr',
    'li',
    'ol',
    'p',
    'pre',
    'ul',
    // Inline text semantics
    'a',
    'b',
    'big',
    'blockquote',
    'br',
    'cite',
    'code',
    'em',
    'i',
    'mark',
    'q',
    's',
    'strike',
    'small',
    'span',
    'strong',
    'sub',
    'u',
    'var',
    // Demarcating edits
    'del',
    'ins',
    // Image and multimedia
    'audio',
    'img',
    'video',
    // Table content
    'caption',
    'col',
    'colgroup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
  ],
  allowedAttributes: {
    '*': [
      'align',
      'alt',
      'bgcolor',
      'center',
      'class',
      'data-*',
      'name',
      'title',
    ],
    a: ['href', 'name', 'rel', 'target', 'aria-label'],
    img: ['height', 'src', 'width'],
  },
  // allowedClasses: {
  // 	'p': [ 'fancy', 'simple' ]
  // },
  allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
  transformTags: {
    a: function (tagName, attrs) {
      if (attrs.href && remoteURL.test(attrs.href)) {
        attrs.target = '_blank';
        attrs.rel = 'noreferrer noopener';
      }
      return { tagName: tagName, attribs: attrs };
    },
  },
};

// sanitize-html laat entities achter (& -> &amp;); waarden die daarna nog door
// nunjucks autoescape gaan zouden dubbel escapen. Decoden naar plain text,
// autoescape doet daarna de (enige) escaping.
var decodeEntities = function (text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
};

module.exports = {
  title: function (text) {
    // TODO: de replace is natuurlijk belachelijk, maar ik heb nergens een combi kunnen vinden waarin sanatize en nunjucks dit fatsoenlijk oplossen. Ik denk dat de weergaven van title naar |safe moeten, want ze zijn toch gesanatized, maar daar heb ik nu geen tijd voor
    return sanitize(text, noTags).replace('&amp;', '&');
  },
  summary: function (text) {
    return sanitize(text, noTags);
  },
  content: function (text) {
    return sanitize(text, allSafeTags);
  },

  argument: function (text) {
    return sanitize(text, noTags);
  },

  // TODO: Transform all call to these two options, instead
  //       of the content-type-named versions above.
  // Non-strings (false/undefined als "niet gezet" in render locals) gaan
  // ongewijzigd door.
  safeTags: function (text) {
    return typeof text === 'string' ? sanitize(text, allSafeTags) : text;
  },
  noTags: function (text) {
    return typeof text === 'string' ? sanitize(text, noTags) : text;
  },

  // Voor render locals die de template onder autoescape toont: tags strippen,
  // entities terugdecoden zodat autoescape niet dubbel escapet.
  plainText: function (text) {
    return typeof text === 'string'
      ? decodeEntities(sanitize(text, noTags))
      : text;
  },

  // Views gebruiken alleen client.name en client.clientId; geef nooit het
  // hele (Sequelize-)clientobject aan res.render.
  client: function (client) {
    if (!client) return {};
    return {
      name: module.exports.plainText(client.name),
      clientId: module.exports.plainText(client.clientId),
    };
  },
};
