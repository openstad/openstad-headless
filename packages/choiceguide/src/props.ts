import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type ChoiceGuideProps = BaseProps &
    ProjectSettingProps &
    ChoiceGuide;

export type ChoiceGuide = {
    noOfQuestionsToShow: string;
    startWithAllQuestionsAnswered: boolean;
    startWithAllQuestionsAnsweredAndConfirmed?: boolean;
    showPageCountAndCurrentPageInButton: boolean;
    choicesType: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden';
    imageAspectRatio: '16x9' | '1x1';
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
    sliderTitleUnderA?: string;
    sliderTitleUnderB?: string;
    explanationA?: string;
    explanationB?: string;
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
    weights: Record<string, Weight>;
};

export type Weight = {
    weightX: string | number;
    weightY: string | number;
    choice: Record<string, Weight>;
} | {}

export type DimensionWeights = Record<'x' | 'y', string | number>;
export type ChoiceWeights = Record<string, DimensionWeights>;
export type GroupWeights = Record<number, DimensionWeights | ChoiceWeights>;
export type WeightOverview = Record<number, GroupWeights>;