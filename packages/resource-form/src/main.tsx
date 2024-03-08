import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResourceFormWidgetProps } from './props.js';
import {ResourceFormWidget} from "./resource-form";

const config: ResourceFormWidgetProps = {
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
            "trigger": "1",
            "title": "Wat is de titel van je plan?",
            "description": "Verzin een mooie titel, deze is zichtbaar voor iedereen",
            "type": "text",
            "fieldKey": "title",
            "fieldRequired": true,
            "minCharacters": "0",
            "maxCharacters": "140",
            "variant": "text input",
            "multiple": true,
            "options": []
        },
        {
            "trigger": "2",
            "title": "Beschrijf je plan",
            "description": "Beschrijf je plan in een aantal woorden",
            "type": "text",
            "fieldKey": "summary",
            "fieldRequired": false,
            "minCharacters": "",
            "maxCharacters": "",
            "variant": "textarea",
            "multiple": true,
            "options": []
        },
        {
            "trigger": "3",
            "title": "Waar valt je plan onder?",
            "description": "Kies een van de onderstaande keuzes. Je kunt er 1 selecteren",
            "type": "radiobox",
            "fieldKey": "category",
            "fieldRequired": true,
            "minCharacters": "",
            "maxCharacters": "",
            "variant": "text input",
            "multiple": true,
            "options": [
                {
                    "trigger": "0",
                    "titles": [
                        {
                            "text": "Duurzaamheid",
                            "key": "Duurzaamheid"
                        }
                    ],
                    "images": []
                },
                {
                    "trigger": "1",
                    "titles": [
                        {
                            "text": "Vervuiling",
                            "key": "Vervuiling"
                        }
                    ],
                    "images": []
                }
            ]
        },
        {
            "trigger": "4",
            "title": "Wat wil je nog zien verder?",
            "description": "Kies uit de onderstaande opties. Je kunt er meerdere selecteren",
            "type": "checkbox",
            "fieldKey": "choices",
            "fieldRequired": true,
            "minCharacters": "",
            "maxCharacters": "",
            "variant": "text input",
            "multiple": true,
            "options": [
                {
                    "trigger": "0",
                    "titles": [
                        {
                            "text": "Duurzame daken",
                            "key": "Duurzame daken"
                        }
                    ],
                    "images": []
                },
                {
                    "trigger": "1",
                    "titles": [
                        {
                            "text": "Meer vervuiling",
                            "key": "Meer vervuiling"
                        }
                    ],
                    "images": []
                },
                {
                    "trigger": "2",
                    "titles": [
                        {
                            "text": "Minder oude mensen",
                            "key": "Minder oude mensen"
                        }
                    ],
                    "images": []
                }
            ]
        },
        {
            "trigger": "5",
            "title": "Waar vindt dit plaats?",
            "description": "Kies een locatie op de kaart",
            "type": "map",
            "fieldKey": "location",
            "fieldRequired": true,
            "minCharacters": "",
            "maxCharacters": "",
            "variant": "text input",
            "multiple": true,
            "options": []
        },
        {
            "trigger": "6",
            "title": "Kies een afbeelding",
            "description": "Plaats hier een afbeelding van de situatie",
            "type": "upload",
            "fieldKey": "image",
            "fieldRequired": false,
            "minCharacters": "",
            "maxCharacters": "",
            "variant": "text input",
            "multiple": false,
            "options": []
        }
    ],
    afterSubmitUrl: "http://localhost:5173/enquetes/[id]",

    resourceType: 'resource',
    formName: 'testformname',
    redirectUrl: 'http://example.com/redirect',
    hideAdmin: false,

    confirmationUser: false,
    confirmationAdmin: false,

    submit: {
        submitButton: 'Opleveren',
        saveButton: 'Opslaan',
        saveConceptButton: 'Opslaan als concept',
    },
    info: {
        loginText: 'Inloggen',
        nameInHeader: false,
        viewable: 'all',
    },
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceFormWidget
        {...config}
    />
  </React.StrictMode>
);
