import { FormValue } from '@openstad-headless/form/src/form';
import { Spacer } from '@openstad-headless/ui/src';
import {
  AccordionProvider,
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
  Textarea,
  Textbox,
} from '@utrecht/component-library-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { InfoImage } from '../../infoImage';
import RteContent from '../../rte-formatting/rte-content';
import './style.css';

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
  rows?: TextInputProps['variant'] extends 'textarea'
    ? number
    : undefined | number;
  type?: string;
  onChange?: (
    e: { name: string; value: FormValue },
    triggerSetLastKey?: boolean
  ) => void;
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

const TrixEditor: React.FC<{
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorInstance = useRef<any>(null);

  const idRef = useRef(
    `trix-editor-${Math.random().toString(36).substring(2, 9)}`
  );

  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        // @ts-expect-error: trix has no types
        await import('trix');
        // @ts-expect-error: trix has no types
        await import('trix/dist/trix.css');

        // Use semantic paragraphs for new blocks created with Enter.
        const trix = (window as any).Trix;
        if (trix?.config?.blockAttributes?.default) {
          trix.config.blockAttributes.default.tagName = 'p';
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const editorEl = editorRef.current;
    const inputEl = inputRef.current;
    if (!editorEl || !inputEl) return;

    const handleTrixInitialize = () => {
      editorInstance.current = (editorEl as any).editor;

      // Remove the file attachment button from the toolbar
      const toolbar = editorEl.parentElement?.querySelector('trix-toolbar');
      if (toolbar) {
        const fileButton = toolbar.querySelector(
          '[data-trix-action="attachFiles"]'
        );
        if (fileButton) {
          fileButton.remove();
        }
      }

      // Load initial content
      if (value && editorInstance.current) {
        editorInstance.current.loadHTML(value);
      }

      // Listen for changes and send change event
      editorEl.addEventListener('trix-change', () => {
        if (editorInstance.current && inputEl) {
          const html = inputEl.value;

          // Create a synthetic React-like ChangeEvent
          const syntheticEvent = {
            target: { value: html },
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(syntheticEvent);
        }
      });
    };

    editorEl.addEventListener('trix-initialize', handleTrixInitialize);
    return () => {
      editorEl.removeEventListener('trix-initialize', handleTrixInitialize);
    };
  }, [onChange]);

  // Keep editor content in sync with external value
  useEffect(() => {
    if (!editorInstance.current || !inputRef.current) return;
    const currentHTML = inputRef.current.value;
    if (currentHTML !== value) {
      editorInstance.current.loadHTML(value || '');
    }
  }, [value]);

  return (
    <div>
      <input ref={inputRef} type="hidden" id={idRef.current} />
      <trix-editor ref={editorRef} input={idRef.current}></trix-editor>
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
  overrideDefaultValue,
  images = [],
  createImageSlider = false,
  imageClickable = false,
  showMinMaxAfterBlur = false,
  maxCharactersOverWarning = 'Je hebt {overCharacters} tekens teveel',
}) => {
  const variantMap = {
    'text input': Textbox,
    textarea: Textarea,
    richtext: TrixEditor,
  };
  const InputComponent = variantMap[variant];

  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <RteContent content={html} unwrapSingleRootDiv={true} />;
    }
  }

  const initialValue = overrideDefaultValue
    ? (overrideDefaultValue as string)
    : defaultValue;

  const [isFocused, setIsFocused] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [value, setValue] = useState(initialValue);
  const [hasBlurred, setHasBlurred] = useState(false);

  const hasInitialValue = !!initialValue;
  const [checkInvalid, setCheckInvalid] = useState(
    fieldRequired && !hasInitialValue
  );

  useEffect(() => {
    if (reset) {
      reset(() => setValue(initialValue));
    }
  }, [reset, defaultValue, initialValue]);

  useEffect(() => {
    // If a value is provided later (e.g. via overrideDefaultValue from a draft),
    // clear invalid state for required fields.
    if (fieldRequired && (overrideDefaultValue || value)) {
      setCheckInvalid(false);
    }
  }, [fieldRequired, overrideDefaultValue, value]);

  useEffect(() => {
    value && setCheckInvalid(false);
  }, []);

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
  };

  useEffect(() => {
    if (reset) {
      reset(() => setValue(initialValue));
    }
  }, [reset, defaultValue]);

  useEffect(() => {
    value && setCheckInvalid(false);
  }, []);

  const characterHelpText = (count: number) => {
    let helpText = '';

    if (!!minCharacters && count < minCharacters) {
      helpText = minCharactersWarning?.replace(
        '{minCharacters}',
        (minCharacters - count).toString()
      );
    } else if (!!maxCharacters && count <= maxCharacters) {
      helpText = maxCharactersWarning?.replace(
        '{maxCharacters}',
        (maxCharacters - count).toString()
      );
    } else if (!!maxCharacters && count > maxCharacters) {
      helpText = maxCharactersOverWarning?.replace(
        '{overCharacters}',
        (count - maxCharacters).toString()
      );
    }

    setHelpText(helpText);
  };

  useEffect(() => {
    if (reset) {
      reset(() => setValue(initialValue));
    }
  }, [reset, defaultValue]);

  useEffect(() => {
    value && setCheckInvalid(false);
  }, []);

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
  };

  const fieldHasMaxOrMinCharacterRules = !!minCharacters || !!maxCharacters;
  const isOverCharacterLimit = !!maxCharacters && value.length > maxCharacters;
  const helpTextId = `${randomId}_help`;
  return (
    <FormField type="text">
      {title && (
        <Paragraph className="utrecht-form-field__label">
          <FormLabel htmlFor={randomId}>
            <RteContent
              content={title}
              unwrapSingleRootDiv={true}
              forceInline={true}
            />
          </FormLabel>
        </Paragraph>
      )}
      {description && (
        <>
          <FormFieldDescription>
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </FormFieldDescription>
          <Spacer size={0.5} />
        </>
      )}

      {showMoreInfo && (
        <>
          <AccordionProvider
            sections={[
              {
                headingLevel: 3,
                body: <HtmlContent html={moreInfoContent} />,
                expanded: undefined,
                label: moreInfoButton,
              },
            ]}
          />
          <Spacer size={1.5} />
        </>
      )}

      {InfoImage({
        imageFallback: infoImage || '',
        images: images,
        createImageSlider: createImageSlider,
        addSpacer: !!infoImage,
        imageClickable: imageClickable,
      })}

      <div
        className={`utrecht-form-field__input ${fieldHasMaxOrMinCharacterRules ? 'help-text-active' : ''}`}
        aria-invalid={checkInvalid}>
        <InputComponent
          id={randomId}
          name={fieldKey}
          required={fieldRequired}
          type={getType(fieldKey)}
          placeholder={placeholder}
          value={value}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            setValue(e.target.value);
            const valueLength = e.target.value.length;
            const hasMax = maxCharacters > 0;
            const exceedsMax = hasMax && valueLength > maxCharacters;

            if (fieldRequired && valueLength === 0) {
              setCheckInvalid(true);
            } else if (exceedsMax) {
              setCheckInvalid(true);
            } else {
              setCheckInvalid(false);
            }

            if (onChange) {
              onChange({
                name: fieldKey,
                value: e.target.value,
              });
            }
            characterHelpText(valueLength);
          }}
          disabled={disabled}
          rows={rows}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHasBlurred(true);
          }}
          autoComplete={getAutocomplete(fieldKey)}
          aria-describedby={`${randomId}_error${(isFocused || (showMinMaxAfterBlur && hasBlurred)) && helpText ? ` ${helpTextId}` : ''}`}
          aria-invalid={checkInvalid}
        />
        {(isFocused || (showMinMaxAfterBlur && hasBlurred)) && helpText && (
          <FormFieldDescription
            className={`help-text${isOverCharacterLimit ? ' help-text--error' : ''}`}
            id={helpTextId}
            aria-live="polite"
            aria-atomic="true">
            {isOverCharacterLimit && (
              <i
                className="ri-error-warning-line help-text__icon"
                aria-hidden="true"></i>
            )}
            {helpText}
          </FormFieldDescription>
        )}
      </div>
    </FormField>
  );
};

export { TrixEditor };
export default TextInput;
