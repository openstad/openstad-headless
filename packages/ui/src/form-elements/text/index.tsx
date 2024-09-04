import React, { FC, useState, useEffect } from "react";
import { FormField, FormFieldDescription, FormLabel, Paragraph, Textarea, Textbox } from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';
import './style.css';

import 'remirror/styles/all.css';
import { htmlToProsemirrorNode } from 'remirror';
import { BoldExtension, ItalicExtension, BulletListExtension, OrderedListExtension, UnderlineExtension, PlaceholderExtension } from 'remirror/extensions';
import { OnChangeJSON, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ToggleBoldButton, ToggleItalicButton, ListButtonGroup, ToggleUnderlineButton, Toolbar } from '@remirror/react-ui';


export type TextInputProps = {
    title: string;
    description?: string;
    minCharacters?: number;
    minCharactersWarning?: string;
    maxCharacters?: number;
    maxCharactersWarning?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    variant?: 'text input' | 'textarea';
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
    rows?: TextInputProps['variant'] extends 'textarea' ? number : undefined;
    type?: string;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
    reset?: (resetFn: () => void) => void;
}


const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant,
    fieldKey,
    fieldRequired = false,
    placeholder = '',
    defaultValue = '',
    disabled = false,
    onChange,
    minCharacters = 0,
    minCharactersWarning = 'Nog minimaal {minCharacters} tekens',
    maxCharacters = 0,
    maxCharactersWarning = 'Je hebt nog {maxCharacters} tekens over',
    rows,
    reset,
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const InputComponent = variant === 'textarea' ? Textarea : Textbox;

    const [isFocused, setIsFocused] = useState(false);
    const [helpText, setHelpText] = useState('');
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (reset) {
            reset(() => setValue(defaultValue));
        }
    }, [reset, defaultValue]);

    const characterHelpText = (count: number) => {
        let helpText = '';

        if (!!minCharacters && count < minCharacters) {
            helpText = minCharactersWarning?.replace('{minCharacters}', (minCharacters - count).toString());
        } else if (!!maxCharacters && count < maxCharacters) {
            helpText = maxCharactersWarning?.replace('{maxCharacters}', (maxCharacters - count).toString());
        }

        setHelpText(helpText);
    }

    const fieldHasMaxOrMinCharacterRules = !!minCharacters || !!maxCharacters;

    const extensions = () => [
        new BoldExtension({}),
        new ItalicExtension({}),
        new UnderlineExtension({}),
        new BulletListExtension({}),
        new OrderedListExtension({}),
        new PlaceholderExtension({ placeholder: placeholder }),
    ];

    const { manager, state } = useRemirror({
        extensions: extensions,
        stringHandler: htmlToProsemirrorNode,
    });

    return (
        <FormField type="text">
            {title && (
                <Paragraph className="utrecht-form-field__label">
                    <FormLabel htmlFor={randomID}>{title}</FormLabel>
                </Paragraph>
            )}
            {description &&
                <>
                    <FormFieldDescription>
                        {description}
                    </FormFieldDescription>
                    <Spacer size={.5} />
                </>
            }
            <div className={`utrecht-form-field__input ${fieldHasMaxOrMinCharacterRules ? 'help-text-active' : ''}`}>
                {InputComponent.displayName === 'Textbox' && (
                    <InputComponent
                        id={randomID}
                        name={fieldKey}
                        required={fieldRequired}
                        type="text"
                        placeholder={placeholder}
                        defaultValue={defaultValue}
                        onChange={(e) => {
                            if (onChange) {
                                onChange({
                                    name: fieldKey,
                                    value: e.target.value,
                                });
                            }
                            characterHelpText(e.target.value.length)
                        }}
                        disabled={disabled}
                        rows={rows}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />

                )}
                {InputComponent.displayName === 'Textarea' && (
                    <ThemeProvider>
                        <Remirror
                            manager={manager}
                            autoFocus
                            onChange={(e: any) => characterHelpText(e.helpers.getText().length)}
                            initialContent={state}
                            autoRender='end'
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={placeholder}
                            editable={!disabled}
                        >
                            <Toolbar>
                                <ToggleBoldButton />
                                <ToggleItalicButton />
                                <ToggleUnderlineButton />
                                <ListButtonGroup />
                            </Toolbar>

                            <OnChangeJSON
                                onChange={(e) => {
                                    if (onChange) {
                                        onChange(
                                            {
                                            name: fieldKey,
                                            value: JSON.stringify({ textarea: e.content }),
                                        });
                                    }
                                }}
                            />
                        </Remirror>
                    </ThemeProvider>
                )}

                {isFocused && helpText &&
                    <FormFieldDescription className="help-text">{helpText}</FormFieldDescription>
                }
            </div>
        </FormField>
    );
};

export default TextInput;
