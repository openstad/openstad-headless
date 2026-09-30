/**
 * Which nunjucks variables a notification mail can use, and what they look like
 * in the preview.
 *
 * A mail only receives what the code that triggers it puts in `data`, so the
 * list differs per type. Keep this file in sync with the places that build that
 * data:
 *
 * - apps/api-server/src/models/NotificationMessage.js  (project, logo, clientName,
 *   and the resource/user/comment/submission lookups by id)
 * - apps/api-server/src/models/Notification.js         (redirectUrl, submissionContent,
 *   enqueteContent)
 * - apps/api-server/src/routes/api/resource.js         (resource mails)
 * - apps/api-server/src/routes/api/submission.js       (enquete mails)
 * - apps/api-server/src/routes/api/comment.js          (comment mails)
 * - apps/api-server/src/cron/anonymize_inactive_users.js (account about to expire)
 * - the auth-server, for both login types: their body is synced away by
 *   NotificationTemplate.js and rendered there, with its own four variables.
 */
import { NotificationType } from './notification-content';

export type NotificationVariable = {
  /** The nunjucks expression without braces, e.g. `resource.title`. */
  key: string;
  /** What it means, in the admin's language. */
  label: string;
  /** The value the preview renders. */
  sample: any;
};

const SAMPLE_TABLE =
  '<table style="width:100%;border-collapse:collapse" border="1" cellpadding="6">' +
  '<tr><td>Wat is je idee?</td><td>Meer bomen in de straat</td></tr>' +
  '<tr><td>Waarom?</td><td>Voor schaduw in de zomer</td></tr>' +
  '</table>';

/**
 * Every variable the admin can use, keyed by its expression. One catalog, so the
 * list under a mail and the sample data in its preview can never drift apart.
 */
export const NOTIFICATION_VARIABLES: Record<string, NotificationVariable> = {
  // project and layout - added to every mail by NotificationMessage.js
  'project.title': {
    key: 'project.title',
    label: 'De titel van het project',
    sample: 'Voorbeeldproject',
  },
  'project.name': {
    key: 'project.name',
    label: 'De naam van het project',
    sample: 'Voorbeeldproject',
  },
  'project.url': {
    key: 'project.url',
    label: 'De website van het project',
    sample: 'https://voorbeeld.openstad.nl',
  },
  projectName: {
    key: 'projectName',
    label: 'De titel van het project, of de naam als er geen titel is',
    sample: 'Voorbeeldproject',
  },
  projectUrl: {
    key: 'projectUrl',
    label: 'De website van het project',
    sample: 'https://voorbeeld.openstad.nl',
  },
  clientName: {
    key: 'clientName',
    label: 'De naam van de inlogomgeving. In het voorbeeld een vaste waarde.',
    sample: 'Voorbeeldklant',
  },
  logo: {
    key: 'logo',
    label: 'Het logo dat je bij Huisstijl van de e-mails hebt gekozen',
    sample: '',
  },
  imagePath: {
    key: 'imagePath',
    label: 'De map met de standaardafbeeldingen van OpenStad',
    sample: '',
  },

  // user
  'user.name': {
    key: 'user.name',
    label: 'De naam van de ontvanger',
    sample: 'Jan Jansen',
  },
  'user.fullName': {
    key: 'user.fullName',
    label: 'De volledige naam van de ontvanger',
    sample: 'Jan Jansen',
  },
  'user.nickName': {
    key: 'user.nickName',
    label: 'De schermnaam van de ontvanger',
    sample: 'Jantje',
  },
  'user.email': {
    key: 'user.email',
    label: 'Het e-mailadres van de ontvanger',
    sample: 'jan@voorbeeld.nl',
  },
  'user.phoneNumber': {
    key: 'user.phoneNumber',
    label: 'Het telefoonnummer van de ontvanger',
    sample: '0612345678',
  },
  'user.address': {
    key: 'user.address',
    label: 'Het adres van de ontvanger',
    sample: 'Voorbeeldstraat 1',
  },
  'user.postcode': {
    key: 'user.postcode',
    label: 'De postcode van de ontvanger',
    sample: '1234 AB',
  },
  'user.city': {
    key: 'user.city',
    label: 'De woonplaats van de ontvanger',
    sample: 'Amsterdam',
  },
  name: {
    key: 'name',
    label: 'De naam van de ontvanger, korte schrijfwijze',
    sample: 'Jan Jansen',
  },

  // resource
  'resource.title': {
    key: 'resource.title',
    label: 'De titel van de inzending',
    sample: 'Meer bomen in de Voorbeeldstraat',
  },
  'resource.summary': {
    key: 'resource.summary',
    label: 'De samenvatting van de inzending',
    sample: 'Een korte samenvatting van de inzending.',
  },
  'resource.description': {
    key: 'resource.description',
    label: 'De omschrijving van de inzending',
    sample: 'De volledige omschrijving van de inzending.',
  },
  'resource.location': {
    key: 'resource.location',
    label: 'De locatie van de inzending',
    sample: 'Voorbeeldstraat 1',
  },
  'resource.budget': {
    key: 'resource.budget',
    label: 'Het budget van de inzending',
    sample: 10000,
  },
  'resource.modBreaks': {
    key: 'resource.modBreaks',
    label: 'De opmerking van de moderator. Leeg als die er niet is.',
    sample: 'Opmerking van de moderator.',
  },
  'resource.startDateHumanized': {
    key: 'resource.startDateHumanized',
    label: 'De startdatum, uitgeschreven',
    sample: '1 januari 2026',
  },
  'resource.publishDateHumanized': {
    key: 'resource.publishDateHumanized',
    label: 'De publicatiedatum, uitgeschreven',
    sample: '1 januari 2026',
  },
  submissionContent: {
    key: 'submissionContent | safe',
    label: 'Tabel met de ingevulde antwoorden bij de inzending',
    sample: SAMPLE_TABLE,
  },

  // submission (enquete)
  'submission.status': {
    key: 'submission.status',
    label: 'De status van de inzending',
    sample: 'ontvangen',
  },
  'submission.submittedData': {
    key: 'submission.submittedData',
    label: 'De ruwe ingevulde gegevens',
    sample: '{ "vraag": "antwoord" }',
  },
  enqueteContent: {
    key: 'enqueteContent | safe',
    label: 'Tabel met de ingevulde antwoorden van het formulier',
    sample: SAMPLE_TABLE,
  },

  // comment
  'comment.description': {
    key: 'comment.description',
    label: 'De reactie zelf',
    sample: 'Een voorbeeldreactie op deze inzending.',
  },
  'comment.userName': {
    key: 'comment.userName',
    label: 'De naam van wie reageerde. Leeg bij een anonieme reactie.',
    sample: 'Voorbeeldgebruiker',
  },
  'comment.userEmail': {
    key: 'comment.userEmail',
    label: 'Het e-mailadres van wie reageerde',
    sample: 'reactie@voorbeeld.nl',
  },
  'comment.createDateHumanized': {
    key: 'comment.createDateHumanized',
    label: 'Wanneer de reactie is geplaatst, uitgeschreven',
    sample: 'vandaag',
  },
  'comment.sentiment': {
    key: 'comment.sentiment',
    label: 'Voor, tegen of neutraal',
    sample: 'for',
  },
  'comment.parentComment': {
    key: 'comment.parentComment',
    label: 'De reactie waarop gereageerd is',
    sample: 'De reactie waarop deze reactie een antwoord is.',
  },
  unsubscribeUrl: {
    key: 'unsubscribeUrl',
    label: 'Link om deze notificaties uit te zetten',
    sample: 'https://voorbeeld.openstad.nl/uitschrijven',
  },
  embeddedUrl: {
    key: 'embeddedUrl',
    label:
      'Link naar de pagina met de reactie. Leeg als de reactie niet vanuit een widget komt.',
    sample: 'https://voorbeeld.openstad.nl/inzending/1',
  },
  redirectUrl: {
    key: 'redirectUrl',
    label: 'Link naar de inzending in de beheeromgeving',
    sample: 'https://beheer.openstad.nl/projects/1/resources/1',
  },

  // account about to expire
  anonymizeDate: {
    key: 'anonymizeDate',
    label: 'De datum waarop het account verloopt',
    sample: '01-01-2026',
  },

  // login, rendered by the auth-server
  loginurl: {
    key: 'loginurl',
    label: 'De inloglink. Alleen bruikbaar in de inlogmail.',
    sample: 'https://voorbeeld.openstad.nl/login?token=voorbeeld',
  },
  code: {
    key: 'code',
    label: 'De inlogcode. Alleen bruikbaar in het sms-bericht.',
    sample: '123456',
  },
};

/** Added by NotificationMessage.js to every mail it renders. */
const COMMON: string[] = [
  'project.title',
  'project.name',
  'project.url',
  'projectName',
  'clientName',
];

const USER: string[] = [
  'user.name',
  'user.fullName',
  'user.nickName',
  'user.email',
  'user.phoneNumber',
  'user.address',
  'user.postcode',
  'user.city',
  'name',
];

const RESOURCE: string[] = [
  'resource.title',
  'resource.summary',
  'resource.description',
  'resource.location',
  'resource.budget',
  'resource.modBreaks',
  'resource.startDateHumanized',
  'resource.publishDateHumanized',
  'submissionContent',
];

const COMMENT: string[] = [
  'comment.description',
  'comment.userName',
  'comment.userEmail',
  'comment.createDateHumanized',
  'comment.sentiment',
  'unsubscribeUrl',
  'embeddedUrl',
];

/**
 * Per type: everything the mail actually gets. The login types are rendered by
 * the auth-server, so they do not get the common block at all.
 */
export const VARIABLES_BY_TYPE: Record<NotificationType, string[]> = {
  'login email': ['clientName', 'loginurl', 'name', 'project.name'],
  'login sms': ['code'],
  'new published resource - user feedback': [...COMMON, ...USER, ...RESOURCE],
  'updated resource - user feedback': [...COMMON, ...USER, ...RESOURCE],
  'new published resource - admin update': [
    ...COMMON,
    ...USER,
    ...RESOURCE,
    'redirectUrl',
  ],
  'new enquete - admin': [
    ...COMMON,
    ...USER,
    'submission.status',
    'submission.submittedData',
    'enqueteContent',
  ],
  'new enquete - user': [
    ...COMMON,
    ...USER,
    'submission.status',
    'submission.submittedData',
    'enqueteContent',
  ],
  'notification comment - user': [...COMMON, ...COMMENT],
  'notification comment reply - user': [
    ...COMMON,
    ...COMMENT,
    'comment.parentComment',
  ],
  'user account about to expire': [
    ...COMMON,
    ...USER,
    'projectUrl',
    'anonymizeDate',
  ],
};

export function variablesForType(
  type: NotificationType
): NotificationVariable[] {
  return (VARIABLES_BY_TYPE[type] || [])
    .map((name) => NOTIFICATION_VARIABLES[name])
    .filter(Boolean);
}

function setPath(target: Record<string, any>, path: string, value: any) {
  const parts = path.split('.');
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof node[part] !== 'object' || node[part] === null) {
      node[part] = {};
    }
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

/**
 * Sample data for the preview: a value for every variable this type receives,
 * so no `{{ }}` renders as a blank spot. `overrides` wins - the real project and
 * the logged-in admin are better sample data than anything we can make up.
 */
export function buildPreviewContext(
  type: NotificationType,
  overrides: Record<string, any> = {}
): Record<string, any> {
  const context: Record<string, any> = {};

  for (const name of VARIABLES_BY_TYPE[type] || []) {
    const variable = NOTIFICATION_VARIABLES[name];
    if (!variable) continue;
    setPath(context, name, variable.sample);
  }

  // Always present in the layout itself, whatever the type advertises.
  context.logo = context.logo || '';
  context.imagePath = context.imagePath || '';

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      context[key] = { ...(context[key] || {}), ...value };
    } else {
      context[key] = value;
    }
  }

  return context;
}
