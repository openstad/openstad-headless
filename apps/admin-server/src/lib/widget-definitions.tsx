export const WidgetDefinitions = {
  agenda: {
    name: 'Agenda',
    description:
      'Volg in een overzichtelijke tijdlijn welke fases er zijn en wanneer je kan meedoen.',
    image: '/widget_preview/agenda_preview.png',
  },
  choiceguide: {
    name: 'Keuzewijzer',
    description:
      'Vorm je mening over een complex vraagstuk en ontdek de gevolgen van keuzes.',
    image: '/widget_preview/keuzewijzer_preview.png',
  },
  choiceguideResults: {
    name: 'Keuzewijzer resultaat',
    description:
      'Ontdek welke uitkomst past bij de keuzes die jij maakt in de keuzewijzer.',
    image: '/widget_preview/keuzewijzerresultaten-preview.png',
  },
  comments: {
    name: 'Reacties',
    description:
      'Deel je mening, idee of ervaring en ga in gesprek met andere deelnemers.',
    image: '/widget_preview/arguments_preview.png',
  },
  begrootmodule: {
    name: 'Begrootmodule',
    description:
      "Kies welke plannen jij in je 'digitale winkelmandje' stopt, tot het geld op is.",
    image: '/widget_preview/begrootmodule_preview.png',
  },
  simplevoting: {
    name: 'Stemmodule',
    description:
      'Kies uit het overzicht één plan, idee of voorstel, de meeste stemmen gelden.',
    image: '/widget_preview/stemmodule_preview.png',
  },
  enquete: {
    name: 'Enquête',
    description:
      'Beantwoord een vragenlijst, (aanmeld)formulier of een korte poll met één of enkele vragen.',
    image: '/widget_preview/enquete_preview.png',
  },
  resourcesmap: {
    name: 'Inzendingen kaart',
    description: 'Bekijk de kaart met een overzicht van inzendingen.',
    image: '/widget_preview/resource_map_preview.png',
  },
  resourcedetailmap: {
    name: 'Inzending kaart',
    description: 'Bekijk één inzending op de kaart.',
    image: '/widget_preview/resource_map_preview.png',
  },
  counter: {
    name: 'Teller',
    description:
      'Ontdek hoeveel inwoners al hebben meegedaan of hoeveel reacties er zijn.',
    image: '/widget_preview/counter_preview.png',
  },
  datecountdownbar: {
    name: 'Aftelbalk',
    description:
      'Bekijk hoeveel tijd er nog is tot een belangrijke datum of deadline.',
    image: '/widget_preview/date_count_down_preview.png',
  },
  // keuzewijzer: {
  //   name: 'Keuzewijzer',
  //   description: 'Decision guide module',
  //   image: '/widget_preview/keuzewijzer_preview.png',
  // },
  likes: {
    name: 'Likes',
    description: 'Laat eenvoudig zien wat je belangrijk vindt en waardeert.',
    image: '/widget_preview/likes-preview.png',
  },
  rawresource: {
    name: 'Inzending maatwerk',
    description:
      "Maak de inzending detailpagina meer op maat met onderdelen zoals video's en extra velden.",
    image: '/widget_preview/raw_resource_preview.png',
  },
  resourcedetail: {
    name: 'Inzending detailpagina',
    description:
      'Bekijk de openbare pagina van een inzending en geef een like of plaats een reactie.',
    image: '/widget_preview/resource_detail_preview.png',
  },
  resourceform: {
    name: 'Inzending formulier',
    description:
      'Stuur een inzending in die openbaar zichtbaar is voor anderen.',
    image: '/widget_preview/resource_form_preview.png',
  },
  resourceoverview: {
    name: 'Inzendingen overzicht',
    description:
      'Bekijk alle ingestuurde inzendingen en ideeën in één centraal overzicht.',
    image: '/widget_preview/resource_overview_preview.png',
  },
  resourcewithmap: {
    name: 'Interactieve kaart',
    description:
      'Zet je idee of ervaring op de kaart en reageer op plekken in de omgeving.',
    image: '/widget_preview/resource_with_map_preview.png',
  },
  resourcedetailwithmap: {
    name: 'Inzending interactieve kaart',
    description:
      'Bekijk de openbare pagina van een inzending op de interactieve kaart.',
    image: '/widget_preview/resource_detail_with_map_preview.png',
  },
  documentmap: {
    name: 'Interactieve afbeelding',
    description:
      'Reageer door markers te plaatsen op een afbeelding en plaats reacties bij bijdragen van anderen.',
    image: '/widget_preview/documents_with_comments_preview.png',
  },
  account: {
    name: 'Accountgegevens',
    description:
      'Bekijk en bewerk jouw accountgegevens of uitloggen bij je account.',
    image: '/widget_preview/account_preview.png',
  },
  activity: {
    name: 'Gebruikersactiviteit',
    description: 'Bekijk jouw overzicht van activiteiten in projecten.',
    image: '/widget_preview/activity_preview.png',
  },
  distributionmodule: {
    name: 'Verdeelmodule',
    description:
      'Verdeel budgetten of punten over meerdere onderwerpen of voorstellen.',
    image: '/widget_preview/verdeelmodule-preview.png',
  },
  multiprojectresourceoverview: {
    name: 'Projectenoverzicht',
    description:
      'Bekijk alle projecten en/of inzendingen van projecten in één overzicht.',
    image: '/widget_preview/multiproject-inzendingenoverzicht-preview.png',
  },
  // videoSlider: {
  //   name: 'Video Slider',
  //   description: 'Module voor het tonen van een video slider',
  //   image: '/widget_preview/video_slider_preview.png',
  // },
};

export type WidgetDefinition = keyof typeof WidgetDefinitions;

// export const WidgetDefinitions = {
//   agenda: 'Agenda',
//   comments: 'Reacties',
//   begrootmodule: 'Begrootmodule',
//   simplevoting: 'Stemmodule',
//   enquete: 'Enquete',
//   resourcesmap: 'Resource overview map',
//   resourcedetailmap: 'Resource detail map',
//   counter: 'Counter',
//   datecountdownbar: 'Date countdown bar',
//   keuzewijzer: 'Keuzewijzer',
//   likes: 'Like',
//   rawresource: 'Raw resource',
//   resourcedetail: 'Resource detail',
//   resourceform: 'Resource form',
//   resourceoverview: 'Resource overview',
//   resourcewithmap: 'Resource with map',
//   resourcedetailwithmap: 'Resource detail with map',
//   documentmap: 'Documents with comments',
//   account: 'Account gegevens',
// };

// export type WidgetDefinition = keyof typeof WidgetDefinitions;
