import { z } from "zod";
import {CombinedFieldPropsWithType} from "./props";

export const getSchemaForField = (field: CombinedFieldPropsWithType) => {
    const fileSchema = z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        lastModified: z.number(),
        lastModifiedDate: z.date(),
        webkitRelativePath: z.string(),
    });

    switch (field.type) {
        case 'text':
            const min = field.minCharacters || 0;
            let minWarning = field.minCharactersWarning || 'Tekst moet minimaal {minCharacters} karakters bevatten';
            minWarning = minWarning.replace('{minCharacters}', min.toString());

            const max = field.maxCharacters || Infinity;
            let maxWarning = field.maxCharactersWarning || 'Tekst moet maximaal {maxCharacters} karakters bevatten';
            maxWarning = maxWarning.replace('{maxCharacters}', max.toString());

            return z.string().min(min, minWarning).max(max, maxWarning);

        case 'checkbox':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.string().min(3, field.requiredWarning || 'Dit veld is verplicht');
            } else {
                return undefined;
            }
        case 'upload':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.array(fileSchema).min(1, field.requiredWarning || 'Dit veld is verplicht');
            } else {
                return undefined;
            }
        case 'range':
        case 'map':
        case 'radiobox':
        case 'select':
        case 'tickmark-slider':
        case 'imageChoice':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                const warning : string = ('customWarning' in field) ? field.customWarning as string : 'Dit veld is verplicht';
                return z.string().nonempty(warning);
            } else {
                return undefined;
            }
        case 'hidden':
            return undefined;

        default:
            return undefined;
    }
};
