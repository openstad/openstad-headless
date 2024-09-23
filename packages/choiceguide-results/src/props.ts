import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type ChoiceGuideResultsProps = BaseProps &
    ChoiceGuideResults &
    ProjectSettingProps;

export type ChoiceGuideResults = {
    choiceguideWidgetId?: string;
};