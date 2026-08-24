const fs = require('fs');
const nunjucks = require('nunjucks');

const STUB_TEMPLATES = {
  'layout.html':
    '{% block title %}{% endblock %}{% block main %}{% endblock %}',
  '@apostrophecms/pager:macros.html':
    '{% macro render(options, url) %}{% endmacro %}',
  'filters.html': '',
};

class StubLoader {
  getSource(name) {
    if (!(name in STUB_TEMPLATES)) return null;
    return { src: STUB_TEMPLATES[name], path: name, noCache: true };
  }
}

function AreaExtension() {
  this.tags = ['area'];
  this.parse = function (parser, nodes) {
    const token = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);
    return new nodes.CallExtension(this, 'run', args);
  };
  this.run = function () {
    return new nunjucks.runtime.SafeString('');
  };
}

function renderTemplate(templatePath, context) {
  const env = new nunjucks.Environment(new StubLoader(), { autoescape: true });
  env.addExtension('area', new AreaExtension());
  env.addFilter('date', (value) => (value ? String(value) : ''));
  env.addGlobal('apos', {
    attachment: { url: () => 'https://example.com/stub-image.jpg' },
  });

  const src = fs.readFileSync(templatePath, 'utf8');
  return env.renderString(src, context);
}

module.exports = { renderTemplate };
