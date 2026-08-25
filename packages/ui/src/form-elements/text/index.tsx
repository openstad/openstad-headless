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
import DOMPurify from 'dompurify';
import React, { FC, useEffect, useRef, useState } from 'react';

import { InfoImage } from '../../infoImage';
import RteContent from '../../rte-formatting/rte-content';
import './style.css';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'trix-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { input?: string },
        HTMLElement
      >;
    }
  }
}

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

// Parse editor HTML into an inert, sanitized document body. DOMPurify breaks
// the untrusted-text -> HTML flow before it reaches the parser; target/rel are
// kept so existing "open in new tab" links survive a round-trip.
function parseEditorHtml(html: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const clean = DOMPurify.sanitize(html || '', {
    ADD_ATTR: ['target', 'rel'],
  });
  return new DOMParser().parseFromString(clean, 'text/html').body;
}

function getTargetBlankHrefs(html: string): Set<string> {
  const hrefs = new Set<string>();
  if (!html || !html.includes('target')) return hrefs;
  const body = parseEditorHtml(html);
  if (!body) return hrefs;
  body.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href) hrefs.add(href);
  });
  return hrefs;
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
  variant?: 'text input' | 'textarea' | 'richtext' | 'email';
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
  onFocus?: () => void;
  onBlur?: () => void;
}> = ({ value, onChange, onFocus, onBlur }) => {
  const editorRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorInstance = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const valueRef = useRef(value);
  const isFocusedRef = useRef(false);

  const targetBlankHrefsRef = useRef<Set<string>>(new Set());

  const idRef = useRef(
    `trix-editor-${Math.random().toString(36).substring(2, 9)}`
  );

  useEffect(() => {
    (async () => {
      if (typeof window !== 'undefined') {
        // @ts-expect-error: trix has no types
        await import('trix');
        await import('trix/dist/trix.css');

        const trix = (window as any).Trix;

        // Use semantic paragraphs for new blocks created with Enter.
        if (trix?.config?.blockAttributes?.default) {
          trix.config.blockAttributes.default.tagName = 'p';
        }
      }
    })();
  }, []);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const editorEl = editorRef.current;
    const inputEl = inputRef.current;
    if (!editorEl || !inputEl) return;

    const handleTrixInitialize = () => {
      editorInstance.current = (editorEl as any).editor;

      const toolbar = editorEl.parentElement?.querySelector('trix-toolbar');
      if (toolbar) {
        const fileButton = toolbar.querySelector(
          '[data-trix-action="attachFiles"]'
        );
        if (fileButton) {
          fileButton.remove();
        }

        const dialog = toolbar.querySelector('[data-trix-dialog="href"]');
        const linkFields = dialog?.querySelector('.trix-dialog__link-fields');
        if (
          linkFields &&
          !linkFields.querySelector('.trix-target-blank-label')
        ) {
          const label = document.createElement('label');
          label.className = 'trix-target-blank-label';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'trix-target-blank-checkbox';

          label.appendChild(checkbox);
          label.appendChild(
            document.createTextNode(' Openen in nieuw tabblad')
          );

          const buttonGroup = linkFields.querySelector('.trix-button-group');
          linkFields.insertBefore(label, buttonGroup);

          const linkButton = linkFields.querySelector(
            '[data-trix-method="setAttribute"]'
          );
          if (linkButton) {
            linkButton.addEventListener('click', () => {
              const checked = checkbox.checked;
              setTimeout(() => {
                const html = inputEl.value || '';
                const editor = (editorEl as any).editor;
                const currentHref =
                  editor?.composition?.currentAttributes?.href;
                if (!currentHref) return;

                const body = parseEditorHtml(html);
                if (!body) return;
                const link = body.querySelector(
                  `a[href="${CSS.escape(currentHref)}"]`
                );
                if (!link) return;

                if (checked) {
                  link.setAttribute('target', '_blank');
                  link.setAttribute('rel', 'noopener noreferrer');
                  targetBlankHrefsRef.current.add(currentHref);
                } else {
                  link.removeAttribute('target');
                  link.removeAttribute('rel');
                  targetBlankHrefsRef.current.delete(currentHref);
                }

                const updatedHtml = body.innerHTML;
                inputEl.value = updatedHtml;
                const syntheticEvent = {
                  target: { value: updatedHtml },
                } as React.ChangeEvent<HTMLInputElement>;
                onChangeRef.current(syntheticEvent);
              }, 0);
            });
          }
        }
      }

      if (valueRef.current && editorInstance.current) {
        targetBlankHrefsRef.current = getTargetBlankHrefs(valueRef.current);
        editorInstance.current.loadHTML(valueRef.current);
      }
    };

    const handleTrixChange = () => {
      let html = inputEl.value;

      if (targetBlankHrefsRef.current.size > 0) {
        const body = parseEditorHtml(html);
        if (body) {
          let changed = false;
          targetBlankHrefsRef.current.forEach((href) => {
            const link = body.querySelector(`a[href="${CSS.escape(href)}"]`);
            if (link && !link.hasAttribute('target')) {
              link.setAttribute('target', '_blank');
              link.setAttribute('rel', 'noopener noreferrer');
              changed = true;
            }
          });
          if (changed) {
            html = body.innerHTML;
            inputEl.value = html;
          }
        }
      }

      const syntheticEvent = {
        target: { value: html },
      } as React.ChangeEvent<HTMLInputElement>;

      onChangeRef.current(syntheticEvent);
    };

    const handleDialogShow = () => {
      const toolbar = editorEl.parentElement?.querySelector('trix-toolbar');
      const checkbox = toolbar?.querySelector(
        '.trix-target-blank-checkbox'
      ) as HTMLInputElement | null;
      const editor = (editorEl as any).editor;
      if (!checkbox || !editor) return;

      const currentHref = editor.composition?.currentAttributes?.href;
      checkbox.checked = !!(
        currentHref && targetBlankHrefsRef.current.has(currentHref)
      );
    };

    const handleTrixFocus = () => {
      isFocusedRef.current = true;
      if (onFocusRef.current) onFocusRef.current();
    };

    const handleTrixBlur = () => {
      isFocusedRef.current = false;
      if (onBlurRef.current) onBlurRef.current();
    };

    editorEl.addEventListener('trix-initialize', handleTrixInitialize);
    editorEl.addEventListener('trix-change', handleTrixChange);
    editorEl.addEventListener('trix-toolbar-dialog-show', handleDialogShow);
    inputEl.addEventListener('input', handleTrixChange);
    editorEl.addEventListener('trix-focus', handleTrixFocus);
    editorEl.addEventListener('trix-blur', handleTrixBlur);
    return () => {
      editorEl.removeEventListener('trix-initialize', handleTrixInitialize);
      editorEl.removeEventListener('trix-change', handleTrixChange);
      editorEl.removeEventListener(
        'trix-toolbar-dialog-show',
        handleDialogShow
      );
      inputEl.removeEventListener('input', handleTrixChange);
      editorEl.removeEventListener('trix-focus', handleTrixFocus);
      editorEl.removeEventListener('trix-blur', handleTrixBlur);
    };
  }, []);

  useEffect(() => {
    if (!editorInstance.current || !inputRef.current) return;
    if (isFocusedRef.current) return;
    if (inputRef.current.value === value) return;
    const newHrefs = getTargetBlankHrefs(value || '');
    if (newHrefs.size > 0) {
      newHrefs.forEach((h) => targetBlankHrefsRef.current.add(h));
    }
    editorInstance.current.loadHTML(value || '');
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
    email: Textbox,
  };
  const InputComponent = variantMap[variant] || Textbox;

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
      case 'email':
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
  const updateFieldValue = (nextValue: string) => {
    setValue(nextValue);
    const valueLength = nextValue.length;
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
        value: nextValue,
      });
    }

    characterHelpText(valueLength);
  };

  const handleFieldChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const nextValue =
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement | undefined)
        ?.value ??
      (e.target as HTMLInputElement | HTMLTextAreaElement | undefined)?.value ??
      '';
    updateFieldValue(nextValue);
  };

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
        className={`utrecht-form-field__input ${
          fieldHasMaxOrMinCharacterRules ? 'help-text-active' : ''
        }`}
        aria-invalid={checkInvalid}>
        <InputComponent
          id={randomId}
          name={fieldKey}
          required={fieldRequired}
          type={variant === 'email' ? 'email' : getType(fieldKey)}
          placeholder={placeholder}
          value={value}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            if (variant === 'textarea') return;
            handleFieldChange(e);
          }}
          onInput={(
            e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => {
            if (variant !== 'textarea') return;
            handleFieldChange(e);
          }}
          disabled={disabled}
          rows={rows}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHasBlurred(true);
          }}
          autoComplete={
            variant === 'email' ? 'email' : getAutocomplete(fieldKey)
          }
          aria-describedby={`${randomId}_error${
            (isFocused || (showMinMaxAfterBlur && hasBlurred)) && helpText
              ? ` ${helpTextId}`
              : ''
          }`}
          aria-invalid={checkInvalid}
        />
        {(isFocused || (showMinMaxAfterBlur && hasBlurred)) && helpText && (
          <FormFieldDescription
            className={`help-text${
              isOverCharacterLimit ? ' help-text--error' : ''
            }`}
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
