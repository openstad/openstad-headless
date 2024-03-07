import {BaseProps} from "../../types/base-props.js";
import {ProjectSettingProps} from "../../types/project-setting-props.js";

export type ResourceFormWidgetProps = BaseProps &
    ProjectSettingProps &
    ResourceFormWidget;

export type ResourceFormWidget = {
    widgetId?: number;
    afterSubmitUrl?: string;
    displayTitle?: boolean;
    title?: string;
    displayDescription?: boolean;
    description?: string;
    submitButton?: string;
    saveButton?: string;
    saveConceptButton?: string;
    items?: Array<Item>;
};

export type General = {
    resource?: 'resource' | 'article' | 'activeUser' | 'resourceUser' | 'submission',
    formName?: string,
    redirectUrl?: string,
    hideAdmin?: boolean,
};

export type Confirmation = {
    confirmationUser?: boolean,
    confirmationAdmin?: boolean,
};

export type Item = {
    trigger: string;
    title?: string;
    description?: string;
    type?: string;
    fieldKey: string;
    fieldRequired?: boolean;
    minCharacters?: string;
    maxCharacters?: string;
    variant?: string;
    multiple?: boolean;
    images?: Array<{
        image?: any;
        src: string;
    }>;
    options?: Array<Option>;
};

export type Option = {
    trigger: string;
    titles: Array<Title>;
    images?: Array<{
        image?: any;
        src: string;
    }>;
};

export type Title = {
    text: string;
    key: string;
};