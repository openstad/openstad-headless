import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChoiceGuideFormWidgetProps } from './props.js';
import {ChoiceguideResults} from "./choiceguide-results";
import {defaultFormValues} from "./parts/default-values.tsx";

const config: ChoiceGuideFormWidgetProps = {
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
    items: defaultFormValues,
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
        loginText: 'Inloggen om deel te nemen.',
        loginButtonText: 'Inloggen',
        nameInHeader: false,
    },
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChoiceguideResults
        {...config}
    />
  </React.StrictMode>
);
