import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type ChoiceGuideProps = ChoiceGuide &
    ChoiceGuideGeneralSettings &
    BaseProps &
    ProjectSettingProps &
    ExtraProjectSettings;

export type ChoiceGuide = {
    noOfQuestionsToShow?: string;
    showPageCountAndCurrentPageInButton?: boolean;
    choicesType?: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden';
    imageAspectRatio?: '16x9' | '1x1';
    choicesPreferenceMinColor?: string;
    choicesPreferenceMaxColor?: string;
    choicesPreferenceTitle?: string;
    choicesNoPreferenceYetTitle?: string;
    choicesInBetweenPreferenceTitle?: string;
    beforeUrl?: string;
    afterUrl?: string;
    introTitle?: string;
    introDescription?: string;
};

type ExtraProjectSettings = {
    choiceGuide: ChoiceGuide;
    choiceOption?: {
        choiceOptions: ChoiceOptions[] };
    items?: Array<Item>;
    widgetId?: string;
    generalSettings?: ChoiceGuideGeneralSettings
}

export type ChoiceGuideGeneralSettings = {
    submitButtonText?: string;
    nextButtonText?: string;
    loginText?: string;
    loginTextButton?: string;
    loginRequired?: boolean;
};

export type ChoiceGuideSidebarProps = {
    choicesType: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden';
    choicesPreferenceMinColor?: string;
    choicesPreferenceMaxColor?: string;
    choicesPreferenceTitle?: string;
    choicesNoPreferenceYetTitle?: string;
    choicesInBetweenPreferenceTitle?: string;
    startWithAllQuestionsAnswered: boolean;
    choiceOptions?: ChoiceOptions[];
    scores?: Record<string, Score>;
    answers?: Record<string, Record<string, number>>;
    imageAspectRatio?: '16x9' | '1x1';
    image?: string;
    showPageCountAndCurrentPageInButton?: boolean;
    weights?: WeightOverview;
    widgetId?: string;
}

export type Score = {
    x: number;
    y?: number;
    z?: number;
};

export type ChoiceOptions = {
    title?: string;
    description?: string;
    id?: string | number;
    image?: string;
};

export type Item = {
    trigger: string;
    title?: string;
    description?: string;
    type?: string;
    fieldType?: string;
    tags?: string;
    fieldKey?: string;
    fieldRequired?: boolean;
    onlyForModerator?: boolean;
    minCharacters?: string;
    maxCharacters?: string;
    variant?: string;
    multiple?: boolean;
    options?: Array<Option>;
    sliderTitleUnderA?: string;
    sliderTitleUnderB?: string;
    explanationA?: string;
    explanationB?: string;
    weights?: Record<string, Weight>;
    showMoreInfo: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    labelA?: string;
    labelB?: string;
    imageA?: string;
    imageB?: string;
    defaultValue?: string;
};

export type Option = {
    trigger: string;
    titles: Array<Title>;
};

export type Title = {
    text?: string;
    key: string;
    weights?: Record<string, Weight>;
    isOtherOption?: boolean;
    defaultValue?: boolean;
};

export type Weight = {
    weightX?: string | number;
    weightY?: string | number;
    [key: string]: string | number | Weight | undefined;
};

export type DimensionWeights = Record<'x' | 'y', string | number>;
export type ChoiceWeights = Record<string, DimensionWeights>;
export type GroupWeights = Record<number, DimensionWeights | ChoiceWeights>;
export type WeightOverview = Record<number, GroupWeights>;