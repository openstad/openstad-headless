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
            let minWarning = field.minCharactersError || 'Tekst moet minimaal {minCharacters} karakters bevatten';

            if (field.fieldRequired && min == 0) {
                min = 1;
                minWarning = field.requiredWarning || `Het veld '${field.title}' is verplicht`;
            } else {
                minWarning = minWarning.replace('{minCharacters}', min.toString());
            }

            const max = field.maxCharacters || Infinity;
            let maxWarning = field.maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten';
            maxWarning = maxWarning.replace('{maxCharacters}', max.toString());

            if (field.fieldRequired) {
                return z.string().min(min, minWarning).max(max, maxWarning);
            } else {
                return z.string().min(min, minWarning).max(max, maxWarning).optional();
            }

        case 'checkbox':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.string().min(3, field.requiredWarning || `Het veld '${field.title}' is verplicht`);
            } else {
                return undefined;
            }
        case 'documentUpload':
        case 'imageUpload':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return z.array(fileSchema).min(1, field.requiredWarning || `Het veld '${field.title}' is verplicht`);
            } else {
                return undefined;
            }
        case 'map':
            const mapSchema = z.object({
                lat: z.number().optional(),
                lng: z.number().optional(),
            });

            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                return mapSchema.refine((value) => Object.keys(value).length > 0, { message: (field.requiredWarning || `Het veld '${field.title}' is verplicht`) });
            }

            return mapSchema.optional();

        case 'radiobox':
        case 'select':
        case 'tickmark-slider':
        case 'imageChoice':
            if (typeof (field.fieldRequired) !== 'undefined' && field.fieldRequired) {
                const warning : string = ('customWarning' in field) ? field.customWarning as string : `Het veld '${field.title}' is verplicht`;
                return z.string().nonempty(warning);
            } else {
                return undefined;
            }
        case 'hidden':
            return undefined;

        case 'matrix':
            if (typeof field.fieldRequired !== 'undefined' && field.fieldRequired) {
                const warning: string = ('customWarning' in field) ? field.customWarning as string : `Het veld '${field.title}' is verplicht`;
                const triggers = field?.matrix?.rows?.map(row => row?.trigger).filter(Boolean) || [];
                const uniqueTriggers = Array.from(new Set(triggers));

                return z.array(z.string()).refine(
                  (answers) => uniqueTriggers.every(trigger => {
                      return answers.some(answer => answer.startsWith(trigger))
                    }
                  ),
                  { message: warning }
                );
            } else {
                return undefined;
            }

        // Default value for range is "50", so it's never empty.
        // If skipQuestion is true, the value is ignored anyway.
        // Therefore, we don't need validation here.
        case 'range':
            return undefined;

        default:
            return undefined;
    }
};
