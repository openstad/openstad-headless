import React from 'react';
import ReactDOM from 'react-dom/client';
import { Enquete, EnqueteWidgetProps } from './enquete.js';

const config: EnqueteWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  // projectId: import.meta.env.VITE_PROJECT_ID,
  resourceId: import.meta.env.VITE_RESOURCE_ID,
  login: {
    label: import.meta.env.VITE_LOGIN_LABEL,
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID
      }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
  items: [
    {
      key: "",
      key1: "",
      key2: "",
      image: "http://localhost:31450/image/553635fb17a122e8ef8a298722c206ca",
      text1: "",
      text2: "",
      title: "Welkom op <i>Doe Mee Den Haag.</i>",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "10",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "De plek waar jongeren écht meetellen. Vul je mening in, beïnvloed plannen in jouw buurt, en laat zien wat er beter kan.",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "none",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "youth-intro",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      infoBlockExtraButton: "",
      infoBlockShareButton: false,
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "15",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "http://localhost:31450/image/233c9aad378d4637400a4853a8da8079",
      text1: "",
      text2: "",
      title: "Voor <i>Jongeren</i> en Door <i>jongeren</i>",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "18",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      maxChoices: "",
      description: "Deze website is samen met jongeren gemaakt. Zij bepaalden mee hoe alles eruitziet, werkt en welke vragen er gesteld worden.",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "none",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "youth-page",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "21",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "Wat vind <i>jij</i> van je buurt?",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "22",
      variant: "text input",
      fieldKey: "aa",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: true,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "scale",
      fieldRequired: true,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "default",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      infoBlockExtraButton: "",
      infoBlockShareButton: false,
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "24",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "In welke <i>leeftijdscategorie</i> val jij?",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [
        {
          titles: [
            {
              key: "10-15 jaar",
              defaultValue: false,
              isOtherOption: false
            }
          ],
          trigger: "0"
        },
        {
          titles: [
            {
              key: "16-20 jaar",
              defaultValue: false,
              isOtherOption: false
            }
          ],
          trigger: "1"
        },
        {
          titles: [
            {
              key: "21-27 jaar",
              defaultValue: false,
              isOtherOption: false
            }
          ],
          trigger: "2"
        },
        {
          titles: [
            {
              key: "Ouder dan 27 jaar",
              defaultValue: false,
              isOtherOption: false
            }
          ],
          trigger: "3"
        }
      ],
      trigger: "25",
      variant: "text input",
      fieldKey: "cat",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "We gebruiken je leeftijd om te kunnen zien of  verschillende leeftijden meedenken over de buurt!",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "multiplechoice",
      fieldRequired: true,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "default",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      infoBlockExtraButton: "",
      infoBlockShareButton: false,
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "27",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      view: "",
      image: "",
      text1: "",
      text2: "",
      title: "Swipe element",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [
        {
          titles: [
            {
              key: "Test toelichting",
              image: "http://localhost:31450/image/4388dd6f5e5168f7c575c9287b011e00",
              infoField: "Dit is een test voor de toelichting",
              explanationRequired: true
            }
          ],
          trigger: "0"
        },
        {
          titles: [
            {
              key: "Extra info test",
              image: "http://localhost:31450/image/491da85d8b1e17d1fe868eb3cc581bb4",
              infoField: "Adipiscing adipiscing, ullamco cupidatat magna dolor anim. Cupidatat magna dolor anim laboris consequat id. Dolor anim laboris, consequat id veniam duis. Consequat id veniam duis commodo elit laborum. Veniam duis commodo, elit. Elit laborum nostrud officia sint deserunt ex. Nostrud officia sint deserunt ex cillum enim occaecat. Sint deserunt ex cillum enim occaecat eiusmod, exercitation.\n\nAdipiscing ullamco cupidatat, magna dolor anim laboris consequat. Magna dolor anim laboris consequat id. Anim laboris consequat id veniam duis commodo. Consequat id veniam duis commodo elit laborum. Veniam duis commodo, elit."
            }
          ],
          trigger: "7"
        },
        {
          titles: [
            {
              key: "Lichaamsbeweging helpt mij om me beter te voelen.",
              image: "http://localhost:31450/image/024566c7929f549ea0b3e0e147eede06"
            }
          ],
          trigger: "8"
        },
        {
          titles: [
            {
              key: "De wijk voelt veilig voor jongeren",
              image: "http://localhost:31450/image/608a1ed381d795865f2195b87d422cde"
            }
          ],
          trigger: "9"
        },
        {
          titles: [
            {
              key: "In mijn wijk kunnen jongeren genoeg sporten en bewegen",
              image: "http://localhost:31450/image/4c6bd7cbafb01f40b525640a973875bf",
              infoField: "Esse exercitation et ad eu deserunt id. Et, ad eu deserunt. Deserunt id, sint reprehenderit id excepteur. Reprehenderit, id excepteur minim. Minim duis in cillum. In cillum pariatur officia in anim anim eu.\n\nExercitation et, ad eu deserunt. Eu deserunt id sint reprehenderit id. Id sint reprehenderit id excepteur minim duis in. Reprehenderit, id excepteur minim. Minim duis in cillum. In cillum pariatur officia in anim anim eu. Pariatur officia in anim anim eu, ad ea. Anim anim eu ad ea est velit nisi.",
              explanationRequired: true
            }
          ],
          trigger: "11"
        },
        {
          titles: [
            {
              key: "Consectetur consectetur et laborum sunt dolore",
              image: "http://localhost:31450/image/da97db23e953def4f02a5996a455bc50"
            }
          ],
          trigger: "12"
        },
        {
          titles: [
            {
              key: "Ik voel me vaak alleen, ook als ik mensen om me heen heb.",
              image: "http://localhost:31450/image/e30d3452f2482031d2e82d5ca6569f8b"
            }
          ],
          trigger: "13"
        },
        {
          titles: [
            {
              key: " Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben. ",
              image: "http://localhost:31450/image/f59ba9343869b08efaf6cbcb1bedd4d1"
            }
          ],
          trigger: "14"
        }
      ],
      trigger: "28",
      variant: "text input",
      fieldKey: "swipe",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "swipe",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "",
      prevPageText: "",
      questionType: "swipe",
      fieldRequired: true,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "default",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      explanationRequired: false,
      infoBlockExtraButton: "",
      infoBlockShareButton: false,
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "29",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "Wat heb je het <i>liefst</i> in jouw buurt?",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [
        {
          titles: [
            {
              key: "Bredere fietspaden",
              image: "http://localhost:31450/image/063759fd8d60efff4a60421edf03f1a6",
              hideLabel: false,
              description: "Maar dan verdwijnt er groen in je buurt."
            }
          ],
          trigger: "0"
        },
        {
          titles: [
            {
              key: "Meer groen",
              image: "http://localhost:31450/image/314b298568b544cbb445f3354483ca84",
              hideLabel: false,
              description: "Maar dan worden de fietspaden smaller."
            }
          ],
          trigger: "1"
        }
      ],
      trigger: "30",
      variant: "text input",
      fieldKey: "2345678",
      imageAlt: "",
      multiple: false,
      infoField: "Gemeenten worstelen met de beperkte ruimte in wijken: bredere fietspaden zorgen voor meer veiligheid, maar gaan vaak ten koste van groen. Meer groen verbetert leefbaarheid en klimaat, maar kan fietspaden smaller en minder veilig maken.",
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "images",
      fieldRequired: true,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "default",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      infoBlockExtraButton: "",
      infoBlockShareButton: false,
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "32",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "Heb jij een <i>idee</i> dat goed is voor jouw buurt en de jongeren die er wonen?",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "33",
      variant: "textarea",
      fieldKey: "idee",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "Stuur het in! Alles wordt bekeken en samen met jongeren kiezen we welke we gaan uitvoeren.",
      placeholder: "Dit idee... omdat...",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "open",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "",
      text1: "",
      text2: "",
      title: "",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "34",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      maxChoices: "",
      description: "",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "pagination",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    },
    {
      key: "",
      key1: "",
      key2: "",
      image: "http://localhost:31450/image/559bf28d93ad16f39c68bcfd210240ce",
      text1: "",
      text2: "",
      title: "Bedankt voor jouw stem!",
      image1: "",
      image2: "",
      matrix: {
        rows: [],
        columns: []
      },
      options: [],
      trigger: "35",
      variant: "text input",
      fieldKey: "",
      imageAlt: "",
      multiple: false,
      infoField: "",
      maxChoices: "",
      description: "Met jouw stem werkt de gemeente aan een betere stad voor jongeren.",
      placeholder: "",
      showSmileys: false,
      defaultValue: "",
      nextPageText: "Volgende",
      prevPageText: "Vorige",
      questionType: "none",
      fieldRequired: false,
      maxCharacters: "",
      minCharacters: "",
      infoBlockStyle: "youth-outro",
      matrixMultiple: false,
      imageDescription: "",
      maxChoicesMessage: "",
      infoBlockExtraButton: "/test",
      infoBlockShareButton: true,
      routingInitiallyHide: false,
      routingSelectedAnswer: "",
      routingSelectedQuestion: ""
    }
  ],
  title: "",
  datalayer: [],
  formStyle: "youth",
  projectId: "5",
  description: "Qui pariatur et occaecat esse. Ea nisi commodo quis quis esse sint. Minim commodo aute in id laboris et incididunt sit consequat culpa Lorem minim et cillum. Fugiat aliquip quis mollit voluptate magna officia aliquip laborum. Qui nisi reprehenderit eu ipsum excepteur consectetur culpa voluptate ad ea mollit laborum ad. Non cillum ut est velit fugiat adipisicing dolor elit anim cillum non.",
  displayTitle: false,
  afterSubmitUrl: "",
  formVisibility: "always",
  displayDescription: false,
  maxCharactersError: "Tekst moet maximaal {maxCharacters} karakters bevatten",
  minCharactersError: "Tekst moet minimaal {minCharacters} karakters bevatten",
  infoBlockShareButton: true,
  maxCharactersWarning: "Je hebt nog {maxCharacters} tekens over",
  minCharactersWarning: "Nog minimaal {minCharacters} tekens"
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="openstad">
      <Enquete {...config} />
    </div>
  </React.StrictMode>
);
