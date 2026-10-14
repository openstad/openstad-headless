type EmailField = [key: string, label: string];

const AUTH_EMAILS: EmailField[] = [
  ['contactEmail', 'E-mailadres voor contact en hulpvragen'],
  ['fromEmail', 'Afzender adres van login e-mails'],
];

const USER_EMAILS: EmailField[] = [['email', 'E-mailadres']];

function emptiedEmail(
  fields: EmailField[],
  stored: Record<string, unknown> | undefined,
  values: Record<string, unknown>
): string | undefined {
  for (const [key, label] of fields) {
    const before = stored?.[key];
    if (values[key] === '' && typeof before === 'string' && before !== '') {
      return `"${label}" kan niet leeg worden opgeslagen. Vul een e-mailadres in.`;
    }
  }
  return undefined;
}

/** The message for a stored login e-mail address that was emptied. */
export function emptiedAuthEmail(
  stored: Record<string, unknown> | undefined,
  values: Record<string, unknown>
): string | undefined {
  return emptiedEmail(AUTH_EMAILS, stored, values);
}

/** The message for a user's stored e-mail address that was emptied. */
export function emptiedUserEmail(
  stored: Record<string, unknown> | undefined,
  values: Record<string, unknown>
): string | undefined {
  return emptiedEmail(USER_EMAILS, stored, values);
}
