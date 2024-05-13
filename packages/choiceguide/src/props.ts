import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type ChoiceGuideProps = BaseProps &
    ProjectSettingProps &
    ChoiceGuide;

export type ChoiceGuide = {
    preferences?: 'standard' | 'minToPlus' | 'field' | 'none';
    display?: '16:9' | '1:1';
    titlePreference?: string;
    titleNoPreference?: string;
    startHalfway?: boolean;
    urlStartPage?: string;
    urlResultPage?: string;
    groups?: Group;
};

export type Group = {
    title?: string;
    description?: string;
    items?: Array<Item>;
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