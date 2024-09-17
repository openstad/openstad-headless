import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type ResourceFormWidgetProps = BaseProps &
    ProjectSettingProps &
    ResourceFormWidget;

export type ResourceFormWidget = {
    widgetId?: number;
    displayTitle?: boolean;
    title?: string;
    displayDescription?: boolean;
    description?: string;
    submit?: Submit;
    items?: Array<Item>;
    info?: Info;
    confirmation?: Confirmation;
    redirectUrl?: string,
    placeholder?: string,
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

export type Submit = {
    submitButton?: string;
    saveButton?: string;
    saveConceptButton?: string;
};

export type Info = {
    loginText?: string;
    loginButtonText?: string;
    nameInHeader?: boolean;
};

export type Item = {
    trigger: string;
    title?: string;
    description?: string;
    type?: string;
    fieldType?: string;
    tags?: string;
    fieldKey: string;
    fieldRequired?: boolean;
    onlyForModerator?: boolean;
    minCharacters?: string;
    maxCharacters?: string;
    variant?: string;
    multiple?: boolean;
    images?: Array<{
        image?: never;
        src: string;
    }>;
    options?: Array<Option>;
    placeholder?: string,
};

export type Option = {
    trigger: string;
    titles: Array<Title>;
    images?: Array<{
        image?: never;
        src: string;
    }>;
};

export type Title = {
    text: string;
    key: string;
    isOtherOption?: boolean;
    weights?: Record<string, Weight>;
};

type Weight = {
    weightX: string | number;
    weightY: string | number;
};