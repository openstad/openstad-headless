import * as z from 'zod';

const emailSchema = z.string().email();

export function isEmailList(value: string): boolean {
  const emails = value.split(',').map((email) => email.trim());
  return emails.every((email) => emailSchema.safeParse(email).success);
}
