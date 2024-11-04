import React, { FC, useState, useEffect } from "react";
import {
    AccordionProvider,
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Textarea,
    Textbox
} from "@utrecht/component-library-react";
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
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
}


const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant,
    fieldKey,
    fieldRequired = false,
    placeholder,
    defaultValue = '',
    disabled = false,
    onChange,
    minCharacters = 0,
    minCharactersWarning = 'Nog minimaal {minCharacters} tekens',
    maxCharacters = 0,
    maxCharactersWarning = 'Je hebt nog {maxCharacters} tekens over',
    rows,
    reset,
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
   infoImage = '',
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const InputComponent = variant === 'textarea' ? Textarea : Textbox;

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

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

    const getType = (fieldKey: string) => {
        switch (fieldKey) {
            case 'email':
                return 'email';
            case 'tel':
                return 'tel';
            case 'password':
                return 'password';
            default:
                return 'text';
        }
    }

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

    const getAutocomplete = (fieldKey: string) => {
        switch (fieldKey.toLocaleLowerCase()) {
            case 'mail':
                return 'email';
            case 'tel':
                return 'tel';
            case 'password':
                return 'current-password';
            case 'voornaam':
                return 'given-name';
            case 'achternaam':
                return 'family-name';
            case 'straatnaam':
                return 'street-address';
            case 'postcode':
                return 'postal-code';
            case 'woonplaats':
                return 'address-level2';
            case 'land':
                return 'country';
            default:
                return 'on';
        }
    }

    const fieldHasMaxOrMinCharacterRules = !!minCharacters || !!maxCharacters;
    return (
        <FormField type="text">
            {title && (
                <Paragraph className="utrecht-form-field__label">
                    <FormLabel htmlFor={randomID}>{title}</FormLabel>
                </Paragraph>
            )}
            {description &&
                <>
                    <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
                    <Spacer size={.5} />
                </>
            }

            {showMoreInfo && (
                <>
                    <AccordionProvider
                        sections={[
                            {
                                headingLevel: 3,
                                body: <HtmlContent html={moreInfoContent} />,
                                expanded: undefined,
                                label: moreInfoButton,
                            }
                        ]}
                    />
                    <Spacer size={.5} />
                </>
            )}

            {infoImage && (
                <figure className="info-image-container">
                    <img src={infoImage} alt=""/>
                    <Spacer size={.5} />
                </figure>
            )}

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

                <InputComponent
                    id={randomID}
                    name={fieldKey}
                    required={fieldRequired}
                    type={getType(fieldKey)}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
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
                    autoComplete={getAutocomplete(fieldKey)}
                />
                {isFocused && helpText &&
                    <FormFieldDescription className="help-text">{helpText}</FormFieldDescription>
                }
            </div>
        </FormField>
    );
};

export default TextInput;
