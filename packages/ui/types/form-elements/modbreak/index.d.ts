import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';
import './modbreak.css';
import { ModbreakItem } from './normalize-modbreaks';
export type { ModbreakItem };
export type ModbreakFieldProps = {
    fieldKey: string;
    title?: string;
    description?: string;
    fieldRequired?: boolean;
    onlyForModerator?: boolean;
    defaultValue?: ModbreakItem[];
    overrideDefaultValue?: FormValue;
    type?: 'modbreak';
    resources?: {
        modbreakTitle?: string;
    };
    onChange?: (e: {
        name: string;
        value: ModbreakItem[];
    }, triggerSetLastKey?: boolean) => void;
    randomId?: string;
    fieldInvalid?: boolean;
    requiredWarning?: string;
};
declare const ModbreakField: FC<ModbreakFieldProps>;
export default ModbreakField;
