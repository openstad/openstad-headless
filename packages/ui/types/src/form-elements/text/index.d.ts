import { FormValue } from '@openstad-headless/form/src/form';
import React, { FC } from 'react';
import './style.css';
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'trix-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                input?: string;
            }, HTMLElement>;
        }
    }
}
export type TextInputProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    minCharacters?: number;
    minCharactersWarning?: string;
    maxCharacters?: number;
    maxCharactersWarning?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    variant?: 'text input' | 'textarea' | 'richtext';
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
    rows?: TextInputProps['variant'] extends 'textarea' ? number : undefined | number;
    type?: string;
    onChange?: (e: {
        name: string;
        value: FormValue;
    }, triggerSetLastKey?: boolean) => void;
    reset?: (resetFn: () => void) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    minCharactersError?: string;
    maxCharactersError?: string;
    nextPageText?: string;
    prevPageText?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    showMinMaxAfterBlur?: boolean;
    maxCharactersOverWarning?: string;
};
declare const TrixEditor: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}>;
declare const TextInput: FC<TextInputProps>;
export { TrixEditor };
export default TextInput;
