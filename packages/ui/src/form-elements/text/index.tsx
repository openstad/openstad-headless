import React, { FC, useState, useEffect, useRef } from "react";
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
import { FormValue } from "@openstad-headless/form/src/form";

import "trix";
import 'trix/dist/trix.css';
// Temporary TypeScript declaration for 'trix-editor'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'trix-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { input?: string },
        HTMLElement
      >;
    }
  }
}

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
    variant?: 'text input' | 'textarea' | 'richtext';
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
    rows?: TextInputProps['variant'] extends 'textarea' ? number : undefined | number;
    type?: string;
    onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
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
    fieldOptions?: { value: string; label: string }[];
}

const TrixEditor: React.FC<{
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  value: string;
}> = ({ onChange, value }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editorElement = editorRef.current;

    const handleTrixInitialize = () => {
      // Remove the file attachment button from the toolbar
      const toolbar = document.querySelector('trix-toolbar');
      if (toolbar) {
        const fileButton = toolbar.querySelector('[data-trix-action="attachFiles"]');
        if (fileButton) {
          fileButton.remove(); // Remove the file attachment button
        }
      }
    };

    if (editorElement) {
      const inputElement = document.getElementById('trix-editor') as HTMLInputElement;

      if (inputElement) {
        // Set the initial value of the input element
        inputElement.value = value;

        // Trigger Trix initialization
        editorElement.dispatchEvent(new Event('trix-initialize'));
      }

      // Listen for Trix change events
      editorElement.addEventListener('trix-change', (event: Event) => {
        const input = event.target as HTMLInputElement;

        const syntheticEvent = {
          target: { value: input.value },
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

        onChange(syntheticEvent);
      });

      // Listen for the Trix initialization event
      document.addEventListener('trix-initialize', handleTrixInitialize);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('trix-change', () => {});
      }
      document.removeEventListener('trix-initialize', handleTrixInitialize);
    };
  }, [onChange, value]);

  return (
    <div>
      <input id="trix-editor" type="hidden" />
      <trix-editor ref={editorRef} input="trix-editor"></trix-editor>
    </div>
  );
};

const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant = 'textarea',
    fieldKey,
    fieldRequired = false,
    placeholder,
    defaultValue = '',
    onChange,
    disabled = false,
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
    randomId = '',
    fieldInvalid = false,
}) => {
    const variantMap = {
        'text input': Textbox,
        'textarea': Textarea,
        'richtext': TrixEditor
    }
    const InputComponent = variantMap[variant];

    

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

    const getAutocomplete = (fieldKey: string) => {
        switch (fieldKey?.toLocaleLowerCase()) {
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
                    <FormLabel htmlFor={randomId}>{title}</FormLabel>
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
                    <Spacer size={1.5} />
                </>
            )}

            {infoImage && (
                <figure className="info-image-container">
                    <img src={infoImage} alt=""/>
                    <Spacer size={.5} />
                </figure>
            )}

            <div className={`utrecht-form-field__input ${fieldHasMaxOrMinCharacterRules ? 'help-text-active' : ''}`}>
                <InputComponent
                    id={randomId}
                    name={fieldKey}
                    required={fieldRequired}
                    type={getType(fieldKey)}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        setValue(e.target.value);
                        if (onChange) {
                            onChange({
                                name: fieldKey,
                                value: e.target.value,
                            });
                        }
                        characterHelpText(e.target.value.length);
                    }}
                    disabled={disabled}
                    rows={rows}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete={getAutocomplete(fieldKey)}
                    aria-invalid={fieldInvalid}
                    aria-describedby={`${randomId}_error`}
                />
                {isFocused && helpText &&
                  <FormFieldDescription className="help-text">{helpText}</FormFieldDescription>
                }
            </div>
        </FormField>
    );
};

export default TextInput;
