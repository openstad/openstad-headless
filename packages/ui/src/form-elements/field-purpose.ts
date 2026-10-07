export type FieldVariant =
  | 'text input'
  | 'textarea'
  | 'richtext'
  | 'email'
  | 'name'
  | 'given-name'
  | 'family-name'
  | 'tel'
  | 'postal-code'
  | 'street-address'
  | 'address-level2';

type PurposeAttributes = {
  type: 'text' | 'email' | 'tel';
  autoComplete?: string;
};

const purposes: Record<string, PurposeAttributes> = {
  email: { type: 'email', autoComplete: 'email' },
  tel: { type: 'tel', autoComplete: 'tel' },
  name: { type: 'text', autoComplete: 'name' },
  'given-name': { type: 'text', autoComplete: 'given-name' },
  'family-name': { type: 'text', autoComplete: 'family-name' },
  'postal-code': { type: 'text', autoComplete: 'postal-code' },
  'street-address': { type: 'text', autoComplete: 'street-address' },
  'address-level2': { type: 'text', autoComplete: 'address-level2' },
};

export function purposeAttributes(variant?: string): PurposeAttributes {
  return purposes[variant ?? ''] ?? { type: 'text' };
}
