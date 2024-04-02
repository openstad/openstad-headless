import { z } from 'zod';

export const createOmittedSchema = (
  formSchema: z.AnyZodObject,
  schemaKeysToOmit: Array<keyof typeof formSchema['shape']> = []
) =>
  formSchema.omit(
    schemaKeysToOmit.reduce(
      (prev, key) => Object.assign(prev, { [key]: true }),
      {}
    )
  );
