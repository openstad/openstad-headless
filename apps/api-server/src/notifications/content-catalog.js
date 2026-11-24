const AUTOMATIC_MESSAGE =
  'Dit is een automatisch bericht, antwoorden op deze e-mail is niet mogelijk.';

const CONTENT_CATALOG = {
  'new published resource - user feedback': {
    subject: 'Nieuwe inzending op {{ project.title }}',
    fixedBlock: 'submission',
    content: {
      heading: 'Bedankt voor je inzending',
      intro:
        "Beste {{ user.name or 'bezoeker' }},\n\nBedankt voor je inzending! Je inzending is goed ontvangen en staat nu online. Hieronder vind je een overzicht van je inzending.",
      buttonLabel: 'Bekijk je inzending',
      buttonUrl: '{{ redirectUrl }}',
      footer: AUTOMATIC_MESSAGE,
      showLogo: true,
    },
  },
  'new published resource - admin update': {
    subject: 'Nieuwe inzending op {{ project.title }}',
    fixedBlock: 'submission',
    content: {
      heading: 'Nieuwe inzending ontvangen',
      intro:
        'Beste beheerder,\n\nEr is een nieuwe inzending binnengekomen. Hieronder vind je de details:',
      buttonLabel: 'Bekijk de inzending',
      buttonUrl: '{{ redirectUrl }}',
      footer: AUTOMATIC_MESSAGE,
      showLogo: true,
    },
  },
  'updated resource - user feedback': {
    subject: 'Je inzending op {{ project.title }} is aangepast',
    content: {
      heading: 'Er is een inzending aangepast.',
      intro:
        'Beste {{ user.name }},\n\nU heeft recentelijk een van uw inzendingen aangepast. U kunt deze hieronder direct bekijken:',
      buttonLabel: 'Weergeven',
      buttonUrl: '{{ redirectUrl }}',
      footer: '',
      showLogo: true,
    },
  },
  'updated resource - admin update': {
    subject: 'Inzending bijgewerkt op {{ project.title }}',
    content: {
      heading: 'Er is een inzending bijgewerkt.',
      intro:
        'Beste administrator,\n\nEr is recentelijk een bestaande inzending aangepast. Hieronder kunt u de inzending direct bekijken in het admin-paneel.',
      buttonLabel: 'Weergeven',
      buttonUrl: '{{ adminResourceUrl or redirectUrl }}',
      footer: '',
      showLogo: true,
    },
  },
  'new concept resource - user feedback': {
    subject: 'Concept van je inzending op {{ project.title }}',
    content: {
      heading: 'Er is een concept van een inzending aangemaakt.',
      intro:
        'Beste {{ user.name }},\n\nBedankt voor het aanmaken van een concept van een inzending! U kunt het hieronder direct bekijken:',
      buttonLabel: 'Weergeven',
      buttonUrl: '{{ redirectUrl }}',
      footer: '',
      showLogo: true,
    },
  },
  'new enquete - admin': {
    subject: 'Nieuwe enquête-inzending op {{ project.title }}',
    fixedBlock: 'enquete',
    content: {
      heading: 'Nieuwe Enquête Inzending',
      intro:
        'Hallo Admin,\n\nEr is een nieuwe inzending ontvangen van de enquête op de website.',
      buttonLabel: '',
      buttonUrl: '',
      footer: AUTOMATIC_MESSAGE,
      showLogo: true,
    },
  },
  'new enquete - user': {
    subject: 'Bedankt voor het invullen van de enquête',
    fixedBlock: 'enquete',
    content: {
      heading: 'Bedankt voor je Inzending',
      intro:
        'Bedankt voor het invullen van onze enquête! Hieronder vind je een overzicht van je ingevulde gegevens.',
      buttonLabel: '',
      buttonUrl: '',
      footer: 'We nemen zo snel mogelijk contact met je op als dat nodig is.',
      showLogo: true,
    },
  },
  'notification comment - user': {
    subject: 'Nieuwe reactie op je inzending op {{ project.title }}',
    fixedBlock: 'comment',
    unsubscribe: true,
    content: {
      heading: 'Je hebt een nieuwe reactie ontvangen',
      intro:
        "{% if comment.sentiment == 'for' %}Hier zie je een positieve reactie op je inzending.{% elseif comment.sentiment == 'against' %}Hier zie je een negatieve reactie op je inzending.{% else %}Hier zie je de reactie op je inzending.{% endif %} Geplaatst op {{ comment.createDateHumanized }} door {{ comment.userName or 'een anonieme gebruiker' }}.",
      buttonLabel: 'Bekijk de inzending',
      buttonUrl: '{{ embeddedUrl }}',
      footer: '',
      showLogo: true,
    },
  },
  'notification comment reply - user': {
    subject: 'Nieuwe reactie op je reactie op {{ project.title }}',
    fixedBlock: 'commentReply',
    unsubscribe: true,
    content: {
      heading: 'Je hebt een nieuwe reactie ontvangen',
      intro:
        "Hier zie je de reactie op je reactie. Geplaatst op {{ comment.createDateHumanized }} door {{ comment.userName or 'een anonieme gebruiker' }}.",
      buttonLabel: 'Bekijk de inzending',
      buttonUrl: '{{ embeddedUrl }}',
      footer: '',
      showLogo: true,
    },
  },
  'new comment - admin': {
    subject:
      '{% if parentComment %}Nieuwe reactie op een reactie op {{ project.title }}{% else %}Nieuwe reactie op {{ project.title }}{% endif %}',
    fixedBlock: 'adminComment',
    content: {
      heading:
        '{% if parentComment %}Er is een nieuwe reactie op een reactie geplaatst.{% else %}Er is een nieuwe reactie geplaatst.{% endif %}',
      intro:
        'Beste administrator,\n\n{% if parentComment %}Op de inzending {{ resource.title }} is er zojuist gereageerd op een eerdere reactie.{% else %}Op de inzending {{ resource.title }} is er zojuist een nieuwe reactie geplaatst.{% endif %}',
      buttonLabel: 'Weergeven',
      buttonUrl: '{{ redirectUrl }}',
      footer: '',
      showLogo: true,
    },
  },
  'contact message - user': {
    subject: 'Bericht ontvangen over een inzending',
    fixedBlock: 'contactMessage',
    content: {
      heading: 'Bericht ontvangen over een inzending',
      intro:
        'Beste {{ user.name }},\n\n{{ senderName }} heeft een bericht gestuurd over de inzending "{{ resource.title }}".',
      buttonLabel: '',
      buttonUrl: '',
      footer:
        'Reageren kan met een e-mail naar {{ senderEmail }}.\n\nDit is een automatisch bericht. Antwoorden op deze e-mail is niet mogelijk.',
      showLogo: true,
    },
  },
  'new modbreak - user feedback': {
    subject:
      '{% if newModBreaks and newModBreaks.length %}Er is een officiële reactie geplaatst bij {% if isResourceOwner === false %}een inzending waarop u heeft gereageerd{% else %}uw inzending{% endif %}{% else %}Een officiële reactie bij {% if isResourceOwner === false %}een inzending waarop u heeft gereageerd{% else %}uw inzending{% endif %} is aangepast{% endif %}',
    fixedBlock: 'modBreaks',
    unsubscribe: true,
    content: {
      heading:
        '{% if newModBreaks and newModBreaks.length %}Er is een officiële reactie geplaatst.{% else %}Een officiële reactie is aangepast.{% endif %}',
      intro: 'Beste {{ user.name }},',
      buttonLabel: 'Weergeven',
      buttonUrl: '{{ redirectUrl }}',
      footer:
        'Dit is een automatisch bericht. Antwoorden op deze e-mail is niet mogelijk.',
      showLogo: true,
    },
  },
  'user account about to expire': {
    subject: 'We gaan je account verwijderen',
    content: {
      heading: 'We gaan je account verwijderen',
      intro:
        "Beste {{ user.name or 'bezoeker' }},\n\nJe bent al een tijd niet actief geweest op de website {{ projectUrl or projectName }}. We willen niet onnodig je gegevens blijven bewaren, en gaan die daarom verwijderen. Dat betekent dat een eventuele bijdrage die je hebt geleverd op de website, bijvoorbeeld inzendingen en/of reacties, geanonimiseerd worden.\n\nWil je dit liever niet? Dan hoef je alleen een keer in te loggen op de website om je account actief te houden. Doe dit wel voor {{ anonymizeDate }}, want anders gaan we op die dag je gegevens verwijderen.",
      buttonLabel: '',
      buttonUrl: '',
      footer: AUTOMATIC_MESSAGE,
      showLogo: true,
    },
  },
  'project issues warning': {
    subject: 'project issues warning',
    fixedBlock: 'projectWarnings',
    content: {
      heading: 'Er is iets mis met een project.',
      intro:
        'Beste beheerder,\n\nEr is iets mis met een of meer projecten. Hier is de lijst van waarschuwingen:',
      buttonLabel: '',
      buttonUrl: '',
      footer: '',
      showLogo: true,
    },
  },
  'system issues warning': {
    subject: 'system issues warning',
    content: {
      heading: 'Er is iets mis met het systeem.',
      intro:
        'Beste administrator,\n\nEr is iets misgegaan met het systeem. Via de link hieronder kunt u direct naar de omgeving waar de error ingezien kan worden.',
      buttonLabel: 'Weergeven',
      buttonUrl: '{{ errorUrl }}',
      footer: '',
      showLogo: true,
    },
  },
};

const FIXED_BLOCK_DESCRIPTIONS = {
  submission: 'het overzicht van de inzending',
  enquete: 'de ingevulde antwoorden van de enquête',
  comment: 'de reactie',
  commentReply: 'de reactie en de reactie waarop gereageerd is',
  adminComment: 'de reactie en, bij een antwoord, de oorspronkelijke reactie',
  contactMessage: 'het bericht van de afzender',
  modBreaks: 'de officiële reacties',
  projectWarnings: 'de lijst met waarschuwingen',
};

const CONTENT_TEXT_KEYS = [
  'heading',
  'intro',
  'buttonLabel',
  'buttonUrl',
  'footer',
];

function assertValidContent(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('content must be an object');
  }
  for (const [key, fieldValue] of Object.entries(value)) {
    if (key === 'showLogo') {
      if (typeof fieldValue !== 'boolean') {
        throw new Error('content.showLogo must be a boolean');
      }
    } else if (!CONTENT_TEXT_KEYS.includes(key)) {
      throw new Error(`content contains an unknown field: ${key}`);
    } else if (typeof fieldValue !== 'string') {
      throw new Error(`content.${key} must be a string`);
    }
  }
}

function isContentType(type) {
  return Object.prototype.hasOwnProperty.call(CONTENT_CATALOG, type);
}

function catalogEntry(type) {
  if (!isContentType(type)) {
    throw new Error(`No content catalog entry for notification type '${type}'`);
  }
  return CONTENT_CATALOG[type];
}

function fixedBlockDescription(type) {
  const { fixedBlock, unsubscribe } = catalogEntry(type);
  const parts = [];
  if (fixedBlock) parts.push(FIXED_BLOCK_DESCRIPTIONS[fixedBlock]);
  if (unsubscribe) parts.push('een uitschrijflink');
  return parts.join(' en ');
}

module.exports = {
  CONTENT_CATALOG,
  assertValidContent,
  isContentType,
  catalogEntry,
  fixedBlockDescription,
};
