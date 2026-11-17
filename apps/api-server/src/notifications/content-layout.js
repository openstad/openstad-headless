const { catalogEntry } = require('./content-catalog');

const NUNJUCKS_TAG = /(\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\})/;

const TEXT_STYLE =
  'line-height="1.3" font-size="16px" color="#555555" font-family="Helvetica"';
const BLOCK_STYLE =
  'font-size="14px" line-height="22px" color="#444444" font-family="Helvetica"';
const FOOTER_STYLE =
  'line-height="1.3" font-size="14px" color="#999999" font-family="Helvetica" align="center"';
const DIVIDER =
  '<mj-divider border-color="#cccccc" border-width="1px"></mj-divider>';
const SPACER = '<mj-divider border-width="0" padding="10px"></mj-divider>';

const LOGO =
  '{% if logo %}<mj-image src="{{ logo }}" width="150px"></mj-image>{% endif %}';

const UNSUBSCRIBE =
  '{% if unsubscribeUrl %}<mj-text align="center" font-size="12px" color="#999999" font-family="Helvetica">Wil je je uitschrijven? <a href="{{ unsubscribeUrl }}">Uitschrijven</a></mj-text>{% endif %}';

const modBreakList = (listName, sentence) =>
  [
    `{% if ${listName} and ${listName}.length %}`,
    `<mj-text ${TEXT_STYLE}>${sentence}</mj-text>`,
    `{% for mb in ${listName} %}`,
    `<mj-text ${TEXT_STYLE} font-style="italic">{{ mb.description | safe }}{% set mbAuthor = mb.authorName or project.config.resources.modbreakTitle %}{% if mbAuthor %} - {{ mbAuthor }}{% endif %}</mj-text>`,
    '{% endfor %}',
    '{% endif %}',
  ].join('\n');

const MODBREAK_TARGET =
  '{% if isResourceOwner === false %}de inzending "{{ resource.title }}" waarop u heeft gereageerd{% else %}uw inzending "{{ resource.title }}"{% endif %}';

const blockLabel = (text) =>
  `<mj-text ${BLOCK_STYLE} font-weight="700">${text}</mj-text>`;
const blockText = (text) => `<mj-text ${BLOCK_STYLE}>${text}</mj-text>`;

const FIXED_BLOCKS = {
  submission:
    '{% if submissionContent %}{{ submissionContent | safe }}{% endif %}',
  enquete: '{% if enqueteContent %}{{ enqueteContent | safe }}{% endif %}',
  comment: [
    blockLabel('Reactie:'),
    blockText('{{ comment.description }}'),
  ].join('\n'),
  commentReply: [
    blockLabel('Reactie:'),
    blockText('{{ comment.description }}'),
    '{% if comment.parentComment %}',
    blockLabel('Jouw reactie:'),
    blockText('{{ comment.parentComment }}'),
    '{% endif %}',
  ].join('\n'),
  adminComment: [
    '{% if parentComment %}',
    blockLabel('Oorspronkelijke reactie:'),
    blockText('{{ parentComment.description }}'),
    blockLabel('Nieuwe reactie:'),
    '{% else %}',
    blockLabel('Reactie:'),
    '{% endif %}',
    blockText('{{ comment.description }}'),
  ].join('\n'),
  contactMessage: [
    '{% if message %}',
    blockLabel('Bericht van {{ senderName }}'),
    blockText('"{{ message }}"'),
    '{% endif %}',
  ].join('\n'),
  modBreaks: [
    modBreakList(
      'newModBreaks',
      `De redactie heeft een bericht geplaatst bij ${MODBREAK_TARGET}:`
    ),
    modBreakList(
      'changedModBreaks',
      `De redactie heeft een bericht bij ${MODBREAK_TARGET} aangepast:`
    ),
  ].join('\n'),
  projectWarnings:
    '{% for message in messages %}' +
    blockText('{{ message.content }}') +
    '{% endfor %}',
};

function escapeOutsideTags(text) {
  return text
    .split(NUNJUCKS_TAG)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    )
    .join('');
}

function paragraphs(text) {
  return (text || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => escapeOutsideTags(paragraph).replace(/\n/g, '<br/>'));
}

function button(label, url) {
  return [
    `{% set buttonHref %}${escapeOutsideTags(url.trim())}{% endset %}`,
    '{% if buttonHref | trim %}',
    `<mj-button align="left" font-size="15px" font-family="Helvetica" background-color="{{ styling.accentColor }}" href="{{ buttonHref | trim | safe }}">${escapeOutsideTags(label || '')}</mj-button>`,
    '<mj-text font-size="13px" color="#777777" font-family="Helvetica">Werkt de knop niet? Gebruik deze link: {{ buttonHref | trim | safe }}</mj-text>',
    '{% endif %}',
  ].join('\n');
}

function buildContentMjml(type, content) {
  const { fixedBlock, unsubscribe } = catalogEntry(type);
  const parts = [];

  if (content.showLogo) parts.push(LOGO);

  const heading = (content.heading || '').trim();
  if (heading) {
    parts.push(
      `<mj-text font-size="20px" color="{{ styling.accentColor }}" font-family="Helvetica" align="center">${escapeOutsideTags(heading).replace(/\n/g, ' ')}</mj-text>`,
      DIVIDER
    );
  }

  paragraphs(content.intro).forEach((paragraph) =>
    parts.push(`<mj-text ${TEXT_STYLE}>${paragraph}</mj-text>`)
  );

  if (fixedBlock) parts.push(SPACER, FIXED_BLOCKS[fixedBlock]);

  if ((content.buttonUrl || '').trim()) {
    parts.push(SPACER, button(content.buttonLabel, content.buttonUrl));
  }

  const footer = paragraphs(content.footer);
  if (footer.length) {
    parts.push(
      SPACER,
      DIVIDER,
      ...footer.map(
        (paragraph) => `<mj-text ${FOOTER_STYLE}>${paragraph}</mj-text>`
      )
    );
  }

  if (unsubscribe) parts.push(UNSUBSCRIBE);

  return [
    '<mjml>',
    '  <mj-body background-color="#f6f6f7">',
    '    <mj-section background-color="#ffffff" padding="20px">',
    '      <mj-column>',
    parts.join('\n'),
    '      </mj-column>',
    '    </mj-section>',
    '  </mj-body>',
    '</mjml>',
  ].join('\n');
}

module.exports = {
  buildContentMjml,
};
