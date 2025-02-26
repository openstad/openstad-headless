import React from 'react';
import ReactDOM from 'react-dom/client';
import { DistributionModule, DistributionModuleWidgetProps } from './enquete.js';

const config: DistributionModuleWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID,
  resourceId: import.meta.env.VITE_RESOURCE_ID,
  login: {
    label: import.meta.env.VITE_LOGIN_LABEL,
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
  displayTitle: true,
  title: 'Denk je met ons mee voor jouw woning en woongebouw?',
  displayDescription: true,
  description:
    'Op de laatste digitale denktank waren 11 bewoners. We hebben hun mening gevraagd over ontwerpkeuzes voor de renovatie. Maar we vinden het belangrijk meer bewoners te horen over hun voorkeuren. Omdat we soms nog twijfels hoorden. Daarom deze extra vragenlijst voor jou. Laat je ons weten wat jouw voorkeuren zijn? Dan kunnen wij betere keuzes maken. Natuurlijk laten we je weten wat de uitkomst is van de vragenlijst en welke definitieve keuzes we gaan maken.',
  items: [
    {
      trigger: '1',
      title: 'Fietsenstalling',
      key: 'fietsenstalling',
      description:
        'Zoals gevraagd gaan we extra ruimte maken in de berging voor een gezamenlijke fietsenstalling. We willen graag van jou weten waarvoor je deze fietsenstalling wilt gebruiken.',
      questionType: 'scale',
      images: [
        {
          src: 'http://localhost:31450/image/f26d22d6b42148742aaacbcac340faf9',
        },
      ],
    },
    {
      trigger: '2',
      title: 'Voordeuren',
      key: 'voordeuren',
      description:
        'We vinden het belangrijk te weten welke voordeur jouw voorkeur heeft. Wil je liever een deur met een raam of een deur met een spy eye (een klein kijkgaatje). Jouw keuze helpt ons de beste afweging te maken.',
      questionType: 'images',
      images: [],
      options: [
        {
          trigger: '1',
          titles: [
            {
              text: 'Deur 1 - met een raampje',
              key: 'deur1',
            },
            {
              text: 'Deur 2 - met een spy-eye (de spy-eye is te klein om goed te zien op het voorbeeld)',
              key: 'deur2',
            },
          ],
          images: [
            {
              src: 'http://localhost:31450/image/f26d22d6b42148742aaacbcac340faf9',
            },
            {
              src: 'http://localhost:31450/image/f26d22d6b42148742aaacbcac340faf9',
            },
          ],
        },
      ],
    },
    {
      trigger: '3',
      title: '1. Wat wil je stallen in de fietsenstalling?',
      key: 'watwiljestallen',
      description: 'Je kunt meerdere antwoorden kiezen.',
      questionType: 'multiple',
      options: [
        {
          trigger: '1',
          titles: [
            {
              text: 'Fiets',
              key: 'fiets',
            },
          ],
        },
        {
          trigger: '2',
          titles: [
            {
              text: '2 Fietsen',
              key: '2fietsen',
            },
          ],
        },
        {
          trigger: '3',
          titles: [
            {
              text: 'Elektrische fiets',
              key: 'elektrischefiets',
            },
          ],
        },
        {
          trigger: '4',
          titles: [
            {
              text: '2 elektrische fietsen',
              key: '2elektrischefietsen',
            },
          ],
        },
      ],
    },
    {
      trigger: '4',
      title:
        '2. Wil je jouw fietsaccu kunnen opladen in de gezamenlijke fietsenstalling?',
      key: 'fietsaccu',
      questionType: 'multiplechoice',
      options: [
        {
          trigger: '1',
          titles: [
            {
              text: '1. Een natuurpark. De natuur is hier belangrijker dan de mens. Wandelen door het park is mogelijk, maar het belang van de natuur staat voorop.',
              key: '1. Een natuurpark. De natuur is hier belangrijker dan de mens. Wandelen door het park is mogelijk, maar het belang van de natuur staat voorop.',
            },
          ],
        },
        {
          trigger: '2',
          titles: [
            {
              text: '2. Een recreatiepark. Een park dat aantrekkelijk is om in te wandelen, om te zonnen, te spelen. Misschien ook met een of meer horecavoorzieningen.',
              key: '2. Een recreatiepark. Een park dat aantrekkelijk is om in te wandelen, om te zonnen, te spelen. Misschien ook met een of meer horecavoorzieningen.',
            },
          ],
        },
        {
          trigger: '3',
          titles: [
            {
              text: '4. Een doe-park. Een park waar buurtbewoners actief in participeren. Denk aan tuinieren of helpen met het onderhoud van het park. Of door gezamenlijk een activiteit te ontwikkelen en te beheren. Bijvoorbeeld huisvesting van een vereniging met buitenactiviteiten.',
              key: '4. Een doe-park. Een park waar buurtbewoners actief in participeren. Denk aan tuinieren of helpen met het onderhoud van het park. Of door gezamenlijk een activiteit te ontwikkelen en te beheren. Bijvoorbeeld huisvesting van een vereniging met buitenactiviteiten.',
            },
          ],
        },
      ],
    },
    {
      trigger: '5',
      title: '3. Waarom vind je dat?',
      key: 'waarom',
      questionType: 'open',
    },
    {
      trigger: '6',
      title: 'Kies een mooie afbeelding',
      key: 'image',
      questionType: 'imageUpload',
    }
  ],
  afterSubmitUrl: "http://localhost:5173/enquetes/[id]"
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DistributionModule {...config} />
  </React.StrictMode>
);
