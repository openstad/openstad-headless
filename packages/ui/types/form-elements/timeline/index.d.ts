import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';
import './timeline.css';
type LinkKind = 'link' | 'document';
export type TimelineItem = {
    trigger: string;
    title?: string;
    description?: string;
    activeFrom: string;
    activeTo?: string;
    links?: {
        trigger: string;
        title: string;
        url: string;
        openInNewWindow: boolean;
        kind?: LinkKind;
        soort?: LinkKind;
        documentName?: string;
        fileFormat?: string;
        fileSize?: string;
    }[];
};
export type TimelineFieldProps = {
    fieldKey: string;
    title?: string;
    description?: string;
    fieldRequired?: boolean;
    onlyForModerator?: boolean;
    allowedTypes?: string[];
    imageUrl?: string;
    defaultValue?: TimelineItem[];
    overrideDefaultValue?: FormValue;
    type?: 'timeline';
    onChange?: (e: {
        name: string;
        value: TimelineItem[];
    }, triggerSetLastKey?: boolean) => void;
    randomId?: string;
    fieldInvalid?: boolean;
    requiredWarning?: string;
};
declare const TimelineField: FC<TimelineFieldProps>;
export default TimelineField;
