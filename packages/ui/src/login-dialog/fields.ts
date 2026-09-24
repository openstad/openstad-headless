export type LoginFieldType = 'text' | 'checkbox';

export const defaultFieldLabels: Record<string, string> = {
  name: 'Naam',
  email: 'E-mail adres',
  phoneNumber: 'Telefoonnummer',
  streetName: 'Straat',
  houseNumber: 'Huisnummer',
  suffix: 'Toevoeging',
  postcode: 'Postcode',
  city: 'Woonplaats',
  emailNotificationConsent: 'E-mail notificatie toestemming',
  privacyConsent: 'Privacy toestemming',
  accessCode: 'Toegangscode',
};

const checkboxFields = ['emailNotificationConsent', 'privacyConsent'];
const optionalFields = ['emailNotificationConsent'];

export const fieldTypeFor = (key: string): LoginFieldType =>
  checkboxFields.includes(key) ? 'checkbox' : 'text';

export const isFieldRequired = (key: string): boolean =>
  !optionalFields.includes(key);

export const fieldLabelFor = (
  key: string,
  labels: Record<string, string> = {}
): string => labels[key] || defaultFieldLabels[key] || key;

export const splitLinkLabel = (label: string) => {
  const index = label.indexOf('{link}');
  if (index === -1) return null;
  return {
    prefix: label.slice(0, index),
    suffix: label.slice(index + '{link}'.length),
  };
};

export const readFieldValues = (
  formData: FormData,
  missingFields: string[]
): Record<string, string | boolean> =>
  Object.fromEntries(
    missingFields.map((key) =>
      fieldTypeFor(key) === 'checkbox'
        ? [key, formData.get(key) === 'on']
        : [key, String(formData.get(key) || '').trim()]
    )
  );
