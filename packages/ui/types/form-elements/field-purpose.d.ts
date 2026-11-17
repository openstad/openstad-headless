export type FieldVariant = 'text input' | 'textarea' | 'richtext' | 'email' | 'name' | 'given-name' | 'family-name' | 'tel' | 'postal-code' | 'street-address' | 'address-level2';
type PurposeAttributes = {
    type: 'text' | 'email' | 'tel';
    autoComplete?: string;
};
export declare function purposeAttributes(variant?: string): PurposeAttributes;
export {};
