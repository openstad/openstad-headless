import { z } from 'zod';

/**
 * Global Dutch error map for zod.
 *
 * The admin UI is Dutch, so zod's built-in English default messages
 * ("Required", "Expected string, received number", …) must never surface in the
 * save bar or form validation. Importing this module once (in _app.tsx) installs
 * the map process-wide. Custom per-field messages (e.g. `z.string().min(1, '…')`)
 * still take precedence — this only replaces the untranslated defaults.
 */
const dutchErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        return { message: 'Dit veld is verplicht.' };
      }
      return { message: 'Ongeldige waarde.' };
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return issue.minimum === 1
          ? { message: 'Dit veld is verplicht.' }
          : { message: `Minimaal ${issue.minimum} tekens.` };
      }
      if (issue.type === 'array') {
        return { message: 'Je moet minimaal één item selecteren.' };
      }
      if (issue.type === 'number') {
        return { message: `Waarde moet minimaal ${issue.minimum} zijn.` };
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Maximaal ${issue.maximum} tekens.` };
      }
      if (issue.type === 'array') {
        return { message: `Maximaal ${issue.maximum} items.` };
      }
      if (issue.type === 'number') {
        return { message: `Waarde mag maximaal ${issue.maximum} zijn.` };
      }
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'Ongeldig e-mailadres.' };
      }
      if (issue.validation === 'url') {
        return { message: 'Ongeldige URL.' };
      }
      break;
    case z.ZodIssueCode.invalid_enum_value:
      return { message: 'Ongeldige keuze.' };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(dutchErrorMap);
