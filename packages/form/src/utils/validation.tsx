import { stripHtmlTags } from '@openstad-headless/lib/strip-html-tags';
import { z } from 'zod';

import { CombinedFieldPropsWithType } from '../props';

const toFiniteInt = (value: unknown, fallback: number): number => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return fallback;
  }

  const n = typeof value === 'number' ? value : Number(String(value));
  if (!Number.isFinite(n)) return fallback;

  return Math.floor(n);
};

const toMinInt = (value: unknown): number => {
  // minCharacters <= 0 is effectively "no minimum"
  const n = toFiniteInt(value, 0);
  return n > 0 ? n : 0;
};

const toMaxInt = (value: unknown): number => {
  // maxCharacters <= 0 or non-numeric is effectively "no maximum"
  const n = toFiniteInt(value, Infinity);
  return n > 0 ? n : Infinity;
};

export const getSchemaForField = (field: CombinedFieldPropsWithType) => {
  const fileSchema = z.object({
    name: z.string(),
    url: z.string(),
  });

  const fieldTitle =
    'title' in field && field.title ? ` '${stripHtmlTags(field.title)}' ` : ' ';

  switch (field.type) {
    case 'text':
      // Some widgets (e.g. Enquete) want an "email field" while still using the generic text field type.
      // We model that as a variant so the UI can render `type="email"` and the schema can validate it.
      if ((field as any)?.variant === 'email') {
        const requiredWarning =
          field.requiredWarning || 'Het veld' + fieldTitle + 'is verplicht';

        const emailWarning =
          (field as any)?.emailError || 'Vul een geldig e-mailadres in';

        const max = toMaxInt((field as any)?.maxCharacters);
        let maxWarning =
          field.maxCharactersError ||
          'Tekst moet maximaal {maxCharacters} karakters bevatten';
        maxWarning = maxWarning.replace('{maxCharacters}', String(max));

        if (field.fieldRequired) {
          // Empty should show the required warning, non-empty but invalid should show the email warning.
          let schema = z.string().min(1, requiredWarning).email(emailWarning);
          if (Number.isFinite(max)) schema = schema.max(max, maxWarning);
          return schema;
        }

        // When not required the value is typically an empty string, not `undefined`.
        // Allow '' but validate any other value.
        return z.union([
          z.literal(''),
          (() => {
            let schema = z.string().email(emailWarning);
            if (Number.isFinite(max)) schema = schema.max(max, maxWarning);
            return schema;
          })(),
        ]);
      }

      const maxRaw = toMaxInt((field as any)?.maxCharacters);
      const minRaw = toMinInt((field as any)?.minCharacters);

      const max = maxRaw;
      let min = minRaw;

      // If both are configured but contradictory, prefer a non-crashing, non-surprising clamp.
      if (Number.isFinite(max) && min > max) {
        min = max;
      }

      let minWarning =
        field.minCharactersError ||
        'Tekst moet minimaal {minCharacters} karakters bevatten';

      if (field.fieldRequired && min == 0) {
        min = 1;
        minWarning =
          field.requiredWarning || 'Het veld' + fieldTitle + 'is verplicht';
      } else {
        minWarning = minWarning.replace('{minCharacters}', min.toString());
      }

      let maxWarning =
        field.maxCharactersError ||
        'Tekst moet maximaal {maxCharacters} karakters bevatten';
      maxWarning = maxWarning.replace('{maxCharacters}', String(max));

      if (field.fieldRequired) {
        let schema = z.string().min(min, minWarning);
        if (Number.isFinite(max)) schema = schema.max(max, maxWarning);
        return schema;
      } else {
        let schema = z.string().min(min, minWarning);
        if (Number.isFinite(max)) schema = schema.max(max, maxWarning);
        return schema.optional();
      }

    case 'checkbox':
      if (typeof field.fieldRequired !== 'undefined' && field.fieldRequired) {
        return z
          .string()
          .min(
            3,
            field.requiredWarning || 'Het veld' + fieldTitle + 'is verplicht'
          );
      } else {
        return undefined;
      }
    case 'documentUpload':
    case 'imageUpload':
      if (typeof field.fieldRequired !== 'undefined' && field.fieldRequired) {
        return z
          .array(fileSchema)
          .min(
            1,
            field.requiredWarning || 'Het veld' + fieldTitle + 'is verplicht'
          );
      } else {
        return undefined;
      }
    case 'map':
      const mapSchema = z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
      });

      if (typeof field.fieldRequired !== 'undefined' && field.fieldRequired) {
        return mapSchema.refine((value) => Object.keys(value).length > 0, {
          message:
            field.requiredWarning || 'Het veld' + fieldTitle + 'is verplicht',
        });
      }

      return mapSchema.optional();

    case 'radiobox':
    case 'select':
    case 'tickmark-slider':
    case 'imageChoice':
      if (typeof field.fieldRequired !== 'undefined' && field.fieldRequired) {
        const warning: string =
          'customWarning' in field
            ? (field.customWarning as string)
            : 'Het veld' + fieldTitle + 'is verplicht';
        return z.string().nonempty(warning);
      } else {
        return undefined;
      }
    case 'hidden':
      return undefined;

    case 'matrix':
      if (typeof field.fieldRequired !== 'undefined' && field.fieldRequired) {
        const warning: string =
          'customWarning' in field
            ? (field.customWarning as string)
            : 'Het veld' + fieldTitle + 'is verplicht';
        const triggers =
          field?.matrix?.rows?.map((row) => row?.trigger).filter(Boolean) || [];
        const uniqueTriggers = Array.from(new Set(triggers));

        return z.array(z.string()).refine(
          (answers) =>
            uniqueTriggers.every((trigger) => {
              return answers.some((answer) => answer.startsWith(trigger));
            }),
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
