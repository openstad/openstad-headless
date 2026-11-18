const { buildQAHtmlTable } = require('../services/qa-processor');

const SAMPLE_URL = 'https://voorbeeld.openstad.org';

const SAMPLE_ANSWERS = [
  { question: 'Wat is je idee?', answer: 'Meer bomen in de straat' },
  { question: 'Waarom?', answer: 'Voor schaduw in de zomer' },
];

function previewData({ project, styling }) {
  const user = {
    name: 'Voorbeeld Gebruiker',
    fullName: 'Voorbeeld Gebruiker',
    email: 'voorbeeld@example.com',
  };
  const answers = buildQAHtmlTable(SAMPLE_ANSWERS);
  const loginUrl = `${SAMPLE_URL}/inloggen?token=voorbeeld`;

  return {
    project,
    logo: styling.logo,
    styling,
    user,
    name: user.name,
    resource: {
      title: 'Meer bomen in de straat',
      description: 'Plant meer bomen voor schaduw in de zomer.',
    },
    comment: {
      description: 'Goed idee, ik steun dit voorstel.',
      userName: 'Buurtbewoner',
      createDateHumanized: '17 november 2026',
      sentiment: 'for',
      parentComment: 'Is hier wel ruimte voor in de straat?',
    },
    parentComment: { description: 'Is hier wel ruimte voor in de straat?' },
    submissionContent: answers,
    enqueteContent: answers,
    redirectUrl: `${SAMPLE_URL}/inzending`,
    adminResourceUrl: `${SAMPLE_URL}/admin/inzending`,
    embeddedUrl: `${SAMPLE_URL}/inzending`,
    unsubscribeUrl: `${SAMPLE_URL}/uitschrijven`,
    errorUrl: `${SAMPLE_URL}/fout`,
    projectUrl: SAMPLE_URL,
    projectName: project.title || project.name,
    senderName: 'Voorbeeld Afzender',
    senderEmail: 'afzender@example.com',
    message: 'Ik heb een vraag over deze inzending.',
    newModBreaks: [
      {
        description: 'Dank voor je inzending, we nemen hem mee.',
        authorName: 'Redactie',
      },
    ],
    changedModBreaks: [],
    isResourceOwner: true,
    messages: [{ content: 'Voorbeeld van een waarschuwing' }],
    anonymizeDate: '01-01-2030',
    code: '123456',
    loginurl: loginUrl,
    tokenUrl: loginUrl,
    clientName: project.name,
    clientUrl: SAMPLE_URL,
  };
}

module.exports = {
  previewData,
};
