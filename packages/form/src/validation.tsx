import { z } from "zod";
import { FieldProps } from "./props.ts";

export const getSchemaForField = (field: FieldProps) => {
    switch (field.type) {
        case 'text':
            const min = field.minCharacters || 0;
            let minWarning = field.minCharacterWarning || 'Tekst moet minimaal {minCharacters} karakters bevatten';
            minWarning = minWarning.replace('{minCharacters}', min.toString());

            const max = field.maxCharacters || Infinity;
            let maxWarning = field.maxCharacterWarning || 'Tekst moet maximaal {maxCharacters} karakters bevatten';
            maxWarning = maxWarning.replace('{maxCharacters}', max.toString());

            return z.string().min(min, minWarning).max(max, maxWarning);

        case 'checkbox':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.string().min(3, field.customWarning || 'Dit veld is verplicht');
            } else {
                return undefined;
            }
        case 'range':
        case 'radiobox':
        case 'select':
        case 'tickmark-slider':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.string().nonempty(field.customWarning || 'Dit veld is verplicht');
            } else {
                return undefined;
            }

        default:
            return undefined;
    }
};
