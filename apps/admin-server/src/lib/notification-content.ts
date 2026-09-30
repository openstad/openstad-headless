/**
 * Content mode for notification templates.
 *
 * An admin edits a mail as a handful of plain-text fields; this module turns
 * those fields into the MJML that ends up in `notification_template.body`.
 * `body` stays the single source for sending - the api-server renders it
 * unchanged (see NotificationMessage.js).
 */

export type NotificationType =
  | 'login email'
  | 'login sms'
  | 'new published resource - user feedback'
  | 'new published resource - admin update'
  | 'updated resource - user feedback'
  | 'user account about to expire'
  | 'new enquete - admin'
  | 'new enquete - user'
  | 'notification comment - user'
  | 'notification comment reply - user';

export type NotificationContent = {
  heading?: string;
  greeting?: string;
  intro?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  footer?: string;
  /** Show the project logo at the top of this mail. Unset = the type default. */
  showLogo?: boolean;
};

export type NotificationContentField = {
  key:
    'heading' | 'greeting' | 'intro' | 'buttonLabel' | 'buttonUrl' | 'footer';
  label: string;
  input: 'text' | 'textarea';
  /** Short help text under the label, for fields whose effect is not obvious. */
  description?: string;
};

// Keep in sync with CONTENT_KEYS in
// apps/api-server/src/models/NotificationTemplate.js - the model rejects any
// other key.
export const NOTIFICATION_CONTENT_FIELDS: NotificationContentField[] = [
  { key: 'heading', label: 'Titel', input: 'text' },
  { key: 'greeting', label: 'Aanhef', input: 'text' },
  { key: 'intro', label: 'Tekst', input: 'textarea' },
  {
    key: 'buttonLabel',
    label: 'Knoptekst',
    input: 'text',
    description:
      'De tekst op de knop. Laat dit veld of de knoplink leeg om de knop weg te laten.',
  },
  {
    key: 'buttonUrl',
    label: 'Knoplink',
    input: 'text',
    description:
      'De bestemming van de knop hierboven. Een variabele zoals {{loginurl}} wordt bij het versturen vervangen door de echte link van de ontvanger.',
  },
  { key: 'footer', label: 'Afsluiting', input: 'textarea' },
];

export const NOTIFICATION_CONTENT_KEYS = NOTIFICATION_CONTENT_FIELDS.map(
  (field) => field.key
);

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  'login email': 'Inloggen via e-mail',
  'login sms': 'Inloggen via sms',
  'new published resource - user feedback':
    'Nieuwe resource gepubliceerd - Notificatie naar de gebruiker',
  'new published resource - admin update':
    'Nieuwe resource gepubliceerd - Notificatie naar de admin',
  'updated resource - user feedback':
    'Resource bijgewerkt - Notificatie naar de gebruiker',
  'user account about to expire':
    'Gebruikersaccount staat op het punt te verlopen',
  'new enquete - admin':
    'Nieuwe formulier inzending - Notificatie naar de admin',
  'new enquete - user':
    'Nieuwe formulier inzending - Notificatie naar de gebruiker',
  'notification comment - user':
    'Nieuwe reactie op een inzending - Notificatie naar de gebruiker',
  'notification comment reply - user':
    'Nieuwe reactie op een reactie - Notificatie naar de gebruiker',
};

/**
 * Short tab labels. The full names above are too long to read in a tab strip.
 */
export const NOTIFICATION_TAB_LABELS: Record<NotificationType, string> = {
  'login email': 'Inloggen e-mail',
  'login sms': 'Inloggen sms',
  'new published resource - user feedback': 'Nieuwe resource (gebruiker)',
  'new published resource - admin update': 'Nieuwe resource (admin)',
  'updated resource - user feedback': 'Resource bijgewerkt',
  'user account about to expire': 'Account verloopt',
  'new enquete - admin': 'Formulier inzending (admin)',
  'new enquete - user': 'Formulier inzending (gebruiker)',
  'notification comment - user': 'Nieuwe reactie',
  'notification comment reply - user': 'Reactie op reactie',
};

export const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPE_LABELS
) as NotificationType[];

/**
 * Blocks the layout renders on its own for a given type. The admin cannot edit
 * them, so the Inhoud tab explains what will appear.
 */
export const FIXED_BLOCKS_BY_TYPE: Partial<Record<NotificationType, string>> = {
  'notification comment - user':
    'Deze e-mail toont de reactie zelf en een uitschrijflink. Die blokken staan vast en zijn niet te bewerken.',
  'notification comment reply - user':
    'Deze e-mail toont de reactie, jouw eigen reactie en een uitschrijflink. Die blokken staan vast en zijn niet te bewerken.',
  'new enquete - admin':
    'Deze e-mail toont een overzicht van de ingevulde antwoorden. Dat blok staat vast en is niet te bewerken.',
  'new enquete - user':
    'Deze e-mail toont een overzicht van de ingevulde antwoorden. Dat blok staat vast en is niet te bewerken.',
  'new published resource - user feedback':
    'Deze e-mail toont een overzicht van de inzending. Dat blok staat vast en is niet te bewerken.',
  'new published resource - admin update':
    'Deze e-mail toont een overzicht van de inzending. Dat blok staat vast en is niet te bewerken.',
  'updated resource - user feedback':
    'Deze e-mail toont een overzicht van de inzending. Dat blok staat vast en is niet te bewerken.',
};

/**
 * The login mail is the only design that ships without a logo at the top. It is
 * a default, not a rule: `content.showLogo` overrules it per mail.
 */
const TYPES_WITHOUT_LOGO: NotificationType[] = ['login email'];

export function defaultShowLogo(type: NotificationType): boolean {
  return !TYPES_WITHOUT_LOGO.includes(type);
}

export function showsLogo(
  type: NotificationType,
  content: NotificationContent | null | undefined
): boolean {
  return typeof content?.showLogo === 'boolean'
    ? content.showLogo
    : defaultShowLogo(type);
}

/**
 * Types that are plain text instead of MJML. Note this is decided by *type*,
 * not by `engine`: both the template table and the admin form default engine to
 * 'email'. Only the sending side picks sms, in Notification.js.
 */
const PLAIN_TEXT_TYPES: NotificationType[] = ['login sms'];

export function isPlainTextType(type: string): boolean {
  return PLAIN_TEXT_TYPES.includes(type as NotificationType);
}

export type NotificationStyling = {
  logo?: string;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
};

/**
 * Fallback colours. An empty value in the project styling means "not set", so
 * every mail falls back to these - see the || chain in renderNotificationMjml.
 */
export const DEFAULT_STYLING: Required<
  Pick<NotificationStyling, 'primaryColor' | 'backgroundColor' | 'textColor'>
> = {
  primaryColor: '#00325F',
  backgroundColor: '#f6f6f7',
  textColor: '#555555',
};

const STYLING_KEYS: Array<keyof NotificationStyling> = [
  'logo',
  'primaryColor',
  'backgroundColor',
  'textColor',
];

/**
 * The styling a project's mails actually use, per field: its own value, else the global
 * settings, else nothing (the caller falls back to DEFAULT_STYLING). An empty string means
 * "not set", the same rule the rest of the mail styling follows, so a project inherits the
 * global brand until it fills a field in itself.
 */
export function resolveInheritedStyling(
  ownStyling?: NotificationStyling | null,
  globalStyling?: NotificationStyling | null
): NotificationStyling {
  const resolved: NotificationStyling = {};
  STYLING_KEYS.forEach((key) => {
    resolved[key] = ownStyling?.[key] || globalStyling?.[key] || '';
  });
  return resolved;
}

const HEADING_COLOR = '#333333';
const FOOTER_COLOR = '#999999';
const DIVIDER_COLOR = '#cccccc';
const SPACER = '          <mj-divider border-width="0" padding="10px" />';

/**
 * Escape characters that would break the surrounding MJML. Nunjucks variables
 * must survive untouched, so `{`, `}` and quotes are left alone.
 */
function escapeMjml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Plain text into MJML: keep paragraph breaks, escape the rest.
 */
function toMjmlParagraphs(value: string): string {
  return escapeMjml(value).replace(/\n/g, '<br />');
}

/**
 * A URL that lands in an href attribute. A quote or an ampersand in there
 * truncates the attribute and makes the whole template invalid MJML.
 */
function escapeMjmlAttribute(value: string): string {
  return escapeMjml(value).replace(/"/g, '&quot;');
}

/**
 * A link field usually holds nothing but a variable, e.g. `{{ embeddedUrl }}`.
 * The handwritten templates wrapped those buttons in `{% if embeddedUrl %}`, so
 * an empty value hides the button instead of shipping `href=""`. Recover that
 * guard by reading the variable name back out of the field.
 */
function guardVariable(value: string): string | null {
  const match = value.trim().match(/^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/);
  return match ? match[1] : null;
}

function fixedBlockMjml(type: NotificationType): string {
  switch (type) {
    case 'notification comment - user':
      return `${SPACER}
          <mj-text font-size="14px" font-weight="700" color="#444" font-family="Helvetica" align="center">Reactie:</mj-text>
          <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">{{ comment.description }}</mj-text>`;
    case 'notification comment reply - user':
      return `${SPACER}
          <mj-text font-size="14px" font-weight="700" color="#444" font-family="Helvetica" align="center">Reactie:</mj-text>
          <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">{{ comment.description }}</mj-text>
          {% if comment.parentComment %}
          <mj-text font-size="14px" font-weight="700" color="#444" font-family="Helvetica" align="center">Jouw reactie:</mj-text>
          <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">{{ comment.parentComment }}</mj-text>
          {% endif %}`;
    case 'new enquete - admin':
    case 'new enquete - user':
      return `${SPACER}

          {{ enqueteContent | safe }}
`;
    case 'new published resource - user feedback':
    case 'new published resource - admin update':
    case 'updated resource - user feedback':
      return `${SPACER}
          <mj-text font-size="14px" line-height="22px" color="#444" font-family="Helvetica">
            {{ submissionContent | safe }}
          </mj-text>`;
    default:
      return '';
  }
}

/**
 * The unsubscribe link the comment mails end with. Kept out of the footer field
 * so an admin cannot accidentally delete the link itself.
 */
function unsubscribeBlockMjml(type: NotificationType): string {
  if (
    type !== 'notification comment - user' &&
    type !== 'notification comment reply - user'
  ) {
    return '';
  }
  return `${SPACER}
          {% if unsubscribeUrl %}
          <mj-text font-size="14px" color="#444" font-family="Helvetica" align="center">Wil je je uitschrijven? Dat kan via de volgende link:<br /><a href="{{ unsubscribeUrl }}">Uitschrijven</a></mj-text>
          {% endif %}`;
}

export function renderPlainTextBody(content: NotificationContent): string {
  return (content.intro || '').trim();
}

export function renderNotificationMjml(
  type: NotificationType,
  content: NotificationContent,
  styling: NotificationStyling = {}
): string {
  if (isPlainTextType(type)) return renderPlainTextBody(content);

  const primaryColor = styling.primaryColor || DEFAULT_STYLING.primaryColor;
  const backgroundColor =
    styling.backgroundColor || DEFAULT_STYLING.backgroundColor;
  const textColor = styling.textColor || DEFAULT_STYLING.textColor;

  const blocks: string[] = [];

  if (showsLogo(type, content)) {
    blocks.push(
      `          <mj-image src="{{ logo or (imagePath + '/logo-openstad.png') }}" width="150px"></mj-image>`
    );
  }

  if (content.heading) {
    blocks.push(
      `          <mj-text font-size="20px" color="${HEADING_COLOR}" font-family="Helvetica" align="center">${toMjmlParagraphs(content.heading)}</mj-text>`
    );
  }

  blocks.push(
    `          <mj-divider border-color="${DIVIDER_COLOR}" border-width="1px"></mj-divider>`
  );
  blocks.push(SPACER);

  if (content.greeting) {
    blocks.push(
      `          <mj-text line-height="1.3" font-size="16px" color="${textColor}" font-family="Helvetica">${toMjmlParagraphs(content.greeting)}</mj-text>`
    );
  }

  if (content.intro) {
    blocks.push(
      `          <mj-text line-height="1.3" font-size="16px" color="${textColor}" font-family="Helvetica">${toMjmlParagraphs(content.intro)}</mj-text>`
    );
  }

  const fixedBlock = fixedBlockMjml(type);
  if (fixedBlock) blocks.push(fixedBlock);

  if (content.buttonLabel && content.buttonUrl) {
    const href = escapeMjmlAttribute(content.buttonUrl);
    const guard = guardVariable(content.buttonUrl);
    const buttonBlocks = [
      `          <mj-button align="left" line-height="1.3" font-size="15px" font-family="Helvetica" background-color="${primaryColor}" href="${href}">${toMjmlParagraphs(content.buttonLabel)}</mj-button>`,
      SPACER,
      `          <mj-text line-height="1.3" font-size="16px" color="${textColor}" font-family="Helvetica">Of gebruik deze link in je browser:</mj-text>`,
      `          <mj-text line-height="1.3" font-size="14px" color="${primaryColor}" font-family="Helvetica">${escapeMjml(content.buttonUrl)}</mj-text>`,
    ];
    blocks.push(
      guard
        ? `          {% if ${guard} %}\n${buttonBlocks.join('\n')}\n          {% endif %}`
        : buttonBlocks.join('\n')
    );
  }

  const unsubscribeBlock = unsubscribeBlockMjml(type);
  if (unsubscribeBlock) blocks.push(unsubscribeBlock);

  if (content.footer) {
    blocks.push(SPACER);
    blocks.push(
      `          <mj-divider border-color="${DIVIDER_COLOR}" border-width="1px"></mj-divider>`
    );
    blocks.push(
      `          <mj-text line-height="1.3" font-size="14px" color="${FOOTER_COLOR}" font-family="Helvetica" align="center">${toMjmlParagraphs(content.footer)}</mj-text>`
    );
  }

  return `<mjml>
  <mj-body background-color="${backgroundColor}">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
${blocks.join('\n')}
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;
}

/**
 * Drop unknown keys and undefined values. The api-server rejects anything
 * outside CONTENT_KEYS, so filter before sending.
 */
export function normalizeContent(
  content: NotificationContent | null | undefined
): NotificationContent {
  const normalized: NotificationContent = {};
  if (!content) return normalized;
  for (const key of NOTIFICATION_CONTENT_KEYS) {
    const value = content[key];
    if (typeof value === 'string') normalized[key] = value;
  }
  if (typeof content.showLogo === 'boolean') {
    normalized.showLogo = content.showLogo;
  }
  return normalized;
}

/**
 * Is this template managed by the content fields? Only the text counts: a lone
 * `showLogo` says nothing about where the body came from.
 */
export function hasContent(
  content: NotificationContent | null | undefined
): boolean {
  const normalized = normalizeContent(content);
  return NOTIFICATION_CONTENT_KEYS.some(
    (key) => (normalized[key] || '').trim().length > 0
  );
}
