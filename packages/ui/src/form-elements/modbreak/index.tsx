import { FormValue } from '@openstad-headless/form/src/form';
import {
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
  Textbox,
} from '@utrecht/component-library-react';
import React, { FC, useEffect, useId, useRef, useState } from 'react';

import { SecondaryButton } from '../../button';
import RteContent from '../../rte-formatting/rte-content';
import { TrixEditor } from '../text/index';
import './modbreak.css';
import {
  ModbreakItem,
  normalizeModBreakDate,
  normalizeModBreaks,
} from './normalize-modbreaks';

export type { ModbreakItem };

export type ModbreakFieldProps = {
  fieldKey: string;
  title?: string;
  description?: string;
  fieldRequired?: boolean;
  onlyForModerator?: boolean;
  defaultValue?: ModbreakItem[];
  overrideDefaultValue?: FormValue;
  type?: 'modbreak';
  resources?: { modbreakTitle?: string };
  onChange?: (
    e: { name: string; value: ModbreakItem[] },
    triggerSetLastKey?: boolean
  ) => void;
  randomId?: string;
  fieldInvalid?: boolean;
  requiredWarning?: string;
};

function newModBreakDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const ModbreakField: FC<ModbreakFieldProps> = ({
  fieldKey,
  title,
  description,
  defaultValue = [],
  overrideDefaultValue,
  onChange,
  randomId = '',
  fieldInvalid = false,
  requiredWarning,
  resources,
}) => {
  const parseInitialValue = (): ModbreakItem[] => {
    let raw: unknown = defaultValue || [];

    if (overrideDefaultValue) {
      if (Array.isArray(overrideDefaultValue)) {
        raw = overrideDefaultValue;
      } else if (typeof overrideDefaultValue === 'string') {
        try {
          raw = JSON.parse(overrideDefaultValue);
        } catch {
          raw = [];
        }
      }
    }

    if (!Array.isArray(raw)) return [];

    return normalizeModBreaks(
      (raw as Array<Partial<ModbreakItem>>).map((item) => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || '',
        authorName: item.authorName ?? '',
        modBreakDate: normalizeModBreakDate(item.modBreakDate),
        createdAt: item.createdAt,
      }))
    );
  };

  const [items, setItems] = useState<ModbreakItem[]>(parseInitialValue);

  const baseId = useId();
  const warningId = `${baseId}-warning`;
  const modbreakTitle = resources?.modbreakTitle || '';

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current({ name: fieldKey, value: items });
    }
  }, [items, fieldKey]);

  const updateItem = (id: string, patch: Partial<ModbreakItem>) => {
    setItems((current) =>
      normalizeModBreaks(
        current.map((item) => (item.id === id ? { ...item, ...patch } : item))
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((current) =>
      normalizeModBreaks([
        ...current,
        {
          id: crypto.randomUUID(),
          description: '',
          authorName: '',
          modBreakDate: newModBreakDate(),
        },
      ])
    );
  };

  return (
    <div
      className="modbreak-field-container"
      aria-invalid={fieldInvalid || undefined}
      aria-describedby={fieldInvalid ? warningId : undefined}>
      <div className="modbreak-header">
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
          <FormFieldDescription>
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </FormFieldDescription>
        )}
      </div>

      <ul className="modbreak-items-list" role="list">
        {items.length === 0 && (
          <li className="modbreak-empty">Nog geen modbreaks toegevoegd.</li>
        )}
        {items.map((item) => {
          const descriptionId = `${baseId}-description-${item.id}`;
          const authorId = `${baseId}-author-${item.id}`;
          const dateId = `${baseId}-date-${item.id}`;

          return (
            <li key={item.id} className="modbreak-item-card">
              <div className="modbreak-item-header">
                <span className="modbreak-item-label">Modbreak</span>
                <button
                  type="button"
                  className="modbreak-action-btn"
                  aria-label="Verwijder modbreak"
                  onClick={() => deleteItem(item.id)}>
                  <i className="ri-close-line" aria-hidden="true" />
                </button>
              </div>

              <FormField type="text">
                <Paragraph className="utrecht-form-field__label">
                  <FormLabel htmlFor={descriptionId}>Inhoud</FormLabel>
                </Paragraph>
                <TrixEditor
                  value={item.description}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                  ) => updateItem(item.id, { description: e.target.value })}
                />
              </FormField>

              <FormField type="text">
                <Paragraph className="utrecht-form-field__label">
                  <FormLabel htmlFor={authorId}>Naam</FormLabel>
                </Paragraph>
                <Textbox
                  id={authorId}
                  value={item.authorName || ''}
                  placeholder={
                    modbreakTitle
                      ? `Laat leeg voor: ${modbreakTitle}`
                      : 'Naam van de auteur'
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateItem(item.id, { authorName: e.target.value })
                  }
                />
              </FormField>

              <FormField type="text">
                <Paragraph className="utrecht-form-field__label">
                  <FormLabel htmlFor={dateId}>Datum en tijd</FormLabel>
                </Paragraph>
                <FormFieldDescription>
                  Staat de tijd op 00:00? Dan wordt alleen de datum getoond.{' '}
                  <button
                    type="button"
                    className="modbreak-set-midnight"
                    onClick={() => {
                      const dateOnly = item.modBreakDate.slice(0, 10);
                      if (dateOnly) {
                        updateItem(item.id, {
                          modBreakDate: `${dateOnly}T00:00`,
                        });
                      }
                    }}>
                    Zet op 00:00
                  </button>
                </FormFieldDescription>
                <Textbox
                  id={dateId}
                  type="datetime-local"
                  value={item.modBreakDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateItem(item.id, {
                      modBreakDate: normalizeModBreakDate(e.target.value),
                    })
                  }
                />
              </FormField>
            </li>
          );
        })}
      </ul>

      <SecondaryButton
        type="button"
        className="modbreak-add-item-btn"
        onClick={addItem}>
        <i className="ri-add-line" aria-hidden="true" />
        Modbreak toevoegen
      </SecondaryButton>

      {fieldInvalid && requiredWarning && (
        <p id={warningId} className="modbreak-field-warning" role="alert">
          {requiredWarning}
        </p>
      )}
    </div>
  );
};

export default ModbreakField;
