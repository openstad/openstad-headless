import { z } from "zod";
import {CombinedFieldPropsWithType} from "./props";

export const getSchemaForField = (field: CombinedFieldPropsWithType) => {
    const fileSchema = z.object({
        name: z.string(),
        url: z.string()
    });

    switch (field.type) {
        case 'text':
            let min = field.minCharacters || 0;
            let minWarning = field.minCharactersWarning || 'Tekst moet minimaal {minCharacters} karakters bevatten';

            if (field.fieldRequired && min == 0) {
                min = 1;
                minWarning = field.requiredWarning || 'Dit veld is verplicht';
            } else {
                minWarning = minWarning.replace('{minCharacters}', min.toString());
            }

            const max = field.maxCharacters || Infinity;
            let maxWarning = field.maxCharactersWarning || 'Tekst moet maximaal {maxCharacters} karakters bevatten';
            maxWarning = maxWarning.replace('{maxCharacters}', max.toString());

            if (field.fieldRequired) {
                return z.string().min(min, minWarning).max(max, maxWarning);
            } else {
                return z.string().min(min, minWarning).max(max, maxWarning).optional();
            }

        case 'checkbox':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.string().min(3, field.requiredWarning || 'Dit veld is verplicht');
            } else {
                return undefined;
            }
        case 'documentUpload':
        case 'imageUpload':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.array(fileSchema).min(1, field.requiredWarning || 'Dit veld is verplicht');
            } else {
                return undefined;
            }
        case 'map':
            const mapSchema = z.object({
                lat: z.number().optional(),
                lng: z.number().optional(),
            });

            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return mapSchema.refine((value) => Object.keys(value).length > 0, { message: (field.requiredWarning || 'Dit veld is verplicht') });
            }

            return mapSchema.optional();

        case 'range':
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
