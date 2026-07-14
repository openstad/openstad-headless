import DataStore from '@openstad-headless/data-store/src';
import { FormValue } from '@openstad-headless/form/src/form';
import NotificationProvider from '@openstad-headless/lib/NotificationProvider/notification-provider';
import NotificationService from '@openstad-headless/lib/NotificationProvider/notification-service';
import {
  fillTimelineEndDates,
  formatDutchDate,
} from '@openstad-headless/lib/timeline-dates';
import {
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
  Textarea,
  Textbox,
} from '@utrecht/component-library-react';
import React, { FC, useEffect, useId, useRef, useState } from 'react';

import { Button, SecondaryButton } from '../../button';
import { Dialog } from '../../dialog';
import { formatFileSize, getFileFormat } from '../../lib/format-file-size';
import RteContent from '../../rte-formatting/rte-content';
import './timeline.css';

type LinkKind = 'link' | 'document';

export type TimelineItem = {
  trigger: string;
  title?: string;
  description?: string;
  activeFrom: string;
  activeTo?: string;
  links?: {
    trigger: string;
    title: string;
    url: string;
    openInNewWindow: boolean;
    kind?: LinkKind;
    soort?: LinkKind;
    documentName?: string;
    fileFormat?: string;
    fileSize?: string;
  }[];
};

export type TimelineFieldProps = {
  fieldKey: string;
  title?: string;
  description?: string;
  fieldRequired?: boolean;
  onlyForModerator?: boolean;
  allowedTypes?: string[];
  imageUrl?: string;
  defaultValue?: TimelineItem[];
  overrideDefaultValue?: FormValue;
  type?: 'timeline';
  onChange?: (
    e: { name: string; value: TimelineItem[] },
    triggerSetLastKey?: boolean
  ) => void;
  randomId?: string;
  fieldInvalid?: boolean;
  requiredWarning?: string;
};

type LinkItem = {
  trigger: string;
  title: string;
  url: string;
  openInNewWindow: boolean;
  kind: LinkKind;
  documentName?: string;
  fileFormat?: string;
  fileSize?: string;
};

type ItemFormState = {
  activeFrom: string;
  title: string;
  description: string;
  links: LinkItem[];
};

const emptyForm = (): ItemFormState => ({
  activeFrom: '',
  title: '',
  description: '',
  links: [],
});

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeItems(items: TimelineItem[]): TimelineItem[] {
  const sorted = [...items].sort((a, b) =>
    a.activeFrom < b.activeFrom ? -1 : a.activeFrom > b.activeFrom ? 1 : 0
  );
  const renumbered = sorted.map((item, idx) => ({
    ...item,
    trigger: String(idx),
  }));
  return fillTimelineEndDates(renumbered);
}

const TimelineField: FC<TimelineFieldProps> = ({
  fieldKey,
  title,
  description,
  fieldRequired,
  allowedTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  imageUrl,
  defaultValue = [],
  overrideDefaultValue,
  onChange,
  randomId = '',
  fieldInvalid = false,
  requiredWarning,
  ...props
}) => {
  const datastore = new DataStore({ props });

  const parseInitialValue = (): TimelineItem[] => {
    if (overrideDefaultValue) {
      if (Array.isArray(overrideDefaultValue))
        return overrideDefaultValue as TimelineItem[];
      if (typeof overrideDefaultValue === 'string') {
        try {
          return JSON.parse(overrideDefaultValue);
        } catch {
          return [];
        }
      }
    }
    return defaultValue || [];
  };

  const [items, setItems] = useState<TimelineItem[]>(parseInitialValue);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<string | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingTrigger, setUploadingTrigger] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadTrigger = useRef<string | null>(null);

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const dateId = `${baseId}-date`;
  const descriptionId = `${baseId}-description`;
  const warningId = `${baseId}-warning`;

  const notifyFailed = (message: string) =>
    NotificationService.addNotification(message, 'error');

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current({ name: fieldKey, value: items });
    }
  }, [items, fieldKey]);

  const openAddDialog = () => {
    setEditingTrigger(null);
    setForm(emptyForm());
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: TimelineItem) => {
    setEditingTrigger(item.trigger);
    setFormError(null);
    setForm({
      activeFrom: item.activeFrom,
      title: item.title && !DATE_ONLY_REGEX.test(item.title) ? item.title : '',
      description: item.description || '',
      links: (item.links || []).map((l) => ({
        trigger: l.trigger,
        title: l.title,
        url: l.url,
        openInNewWindow: l.openInNewWindow,
        kind: l.kind ?? l.soort ?? 'link',
        documentName: l.documentName,
        fileFormat: l.fileFormat,
        fileSize: l.fileSize,
      })),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTrigger(null);
    setForm(emptyForm());
    setFormError(null);
  };

  const saveItem = () => {
    if (!DATE_ONLY_REGEX.test(form.activeFrom)) {
      setFormError('Vul een geldige datum in (jjjj-mm-dd).');
      return;
    }
    setFormError(null);

    const trimmedTitle = form.title.trim();
    const newItem: TimelineItem = {
      trigger: editingTrigger ?? '0',
      activeFrom: form.activeFrom,
      title: trimmedTitle || form.activeFrom,
      description: form.description,
      links: form.links,
    };

    let updated: TimelineItem[];
    if (editingTrigger !== null) {
      updated = items.map((it) =>
        it.trigger === editingTrigger ? newItem : it
      );
    } else {
      updated = [...items, newItem];
    }

    setItems(normalizeItems(updated));
    closeDialog();
  };

  const deleteItem = (trigger: string) => {
    setItems(normalizeItems(items.filter((it) => it.trigger !== trigger)));
  };

  const addLink = () => {
    const newTrigger = String(
      form.links.length > 0
        ? parseInt(form.links[form.links.length - 1].trigger) + 1
        : 0
    );
    setForm((f) => ({
      ...f,
      links: [
        ...f.links,
        {
          trigger: newTrigger,
          title: '',
          url: '',
          openInNewWindow: false,
          kind: 'link',
        },
      ],
    }));
  };

  const updateLink = (trigger: string, patch: Partial<LinkItem>) => {
    setForm((f) => ({
      ...f,
      links: f.links.map((l) =>
        l.trigger === trigger ? { ...l, ...patch } : l
      ),
    }));
  };

  const handleLinkKindChange = (trigger: string, kind: LinkKind) => {
    updateLink(trigger, {
      kind,
      url: '',
      documentName: undefined,
      fileFormat: undefined,
      fileSize: undefined,
      openInNewWindow: kind === 'document',
    });
  };

  const removeLink = (trigger: string) => {
    setForm((f) => ({
      ...f,
      links: f.links.filter((l) => l.trigger !== trigger),
    }));
  };

  const triggerDocumentUpload = (trigger: string) => {
    pendingUploadTrigger.current = trigger;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const trigger = pendingUploadTrigger.current;
    if (!file || !imageUrl || trigger === null) return;

    const fileFormat = getFileFormat(file.name);
    const fileSize = file.size > 0 ? formatFileSize(file.size) : undefined;

    setUploadingTrigger(trigger);
    try {
      const formData = new FormData();
      formData.append('document', file);

      const jwt = datastore?.api?.currentUserJWT;
      const response = await fetch(`${imageUrl}/documents`, {
        method: 'POST',
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        body: formData,
      });

      if (response.ok) {
        const result: { name: string; url: string }[] = await response.json();
        if (result?.[0]) {
          updateLink(trigger, {
            url: result[0].url,
            documentName: result[0].name,
            fileFormat,
            fileSize,
          });
        }
      } else {
        notifyFailed('Document uploaden mislukt. Probeer het opnieuw.');
      }
    } catch {
      notifyFailed('Document uploaden mislukt. Probeer het opnieuw.');
    } finally {
      setUploadingTrigger(null);
      pendingUploadTrigger.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="timeline-field-container"
      aria-invalid={fieldInvalid || undefined}
      aria-describedby={fieldInvalid ? warningId : undefined}>
      <div className="timeline-header">
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

      <ul className="timeline-items-list" role="list">
        {items.length === 0 && (
          <li className="timeline-empty">Nog geen items toegevoegd.</li>
        )}
        {items.map((item) => (
          <li key={item.trigger} className="timeline-item-row">
            <div className="timeline-item-info">
              <span className="timeline-item-date">
                {formatDutchDate(item.activeFrom)}
              </span>
              {item.description && (
                <span className="timeline-item-desc">{item.description}</span>
              )}
            </div>
            <div className="timeline-item-actions">
              <button
                type="button"
                className="timeline-action-btn"
                aria-label="Bewerk item"
                onClick={() => openEditDialog(item)}>
                <i className="ri-pencil-line" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="timeline-action-btn"
                aria-label="Verwijder item"
                onClick={() => deleteItem(item.trigger)}>
                <i className="ri-close-line" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <SecondaryButton
        type="button"
        className="timeline-add-item-btn"
        onClick={openAddDialog}>
        <i className="ri-add-line" aria-hidden="true" />
        Voeg een item toe
      </SecondaryButton>

      {fieldInvalid && requiredWarning && (
        <p id={warningId} className="timeline-field-warning" role="alert">
          {requiredWarning}
        </p>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
        className="timeline-dialog">
        <div className="timeline-dialog-content">
          <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
              <FormLabel htmlFor={dateId}>Datum</FormLabel>
            </Paragraph>
            <Textbox
              id={dateId}
              type="date"
              value={form.activeFrom}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, activeFrom: e.target.value }))
              }
            />
          </FormField>

          <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
              <FormLabel htmlFor={titleId}>Titel</FormLabel>
            </Paragraph>
            <Textbox
              id={titleId}
              value={form.title}
              placeholder="Laat leeg om de datum te tonen"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </FormField>

          <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
              <FormLabel htmlFor={descriptionId}>Omschrijving</FormLabel>
            </Paragraph>
            <Textarea
              id={descriptionId}
              rows={4}
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </FormField>

          <div className="timeline-links-section">
            <p className="timeline-section-label">Externe links</p>
            {form.links.map((link) => {
              const kind = link.kind ?? 'link';
              const isUploading = uploadingTrigger === link.trigger;
              return (
                <div key={link.trigger} className="timeline-link-entry">
                  <div className="timeline-link-labels-row">
                    <span className="timeline-link-col-label">Soort</span>
                    <span className="timeline-link-col-label">
                      {kind === 'document' ? 'Document' : 'Url'}
                    </span>
                    <span className="timeline-link-col-label">Link tekst</span>
                    <button
                      type="button"
                      className="timeline-action-btn"
                      aria-label="Verwijder link"
                      onClick={() => removeLink(link.trigger)}>
                      <i className="ri-close-line" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="timeline-link-fields">
                    <select
                      className="timeline-link-kind-select"
                      aria-label="Soort link"
                      value={kind}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleLinkKindChange(
                          link.trigger,
                          e.target.value as LinkKind
                        )
                      }>
                      <option value="link">Link</option>
                      <option value="document">Document</option>
                    </select>

                    {kind === 'document' ? (
                      <button
                        type="button"
                        className={
                          link.documentName
                            ? 'timeline-doc-button timeline-doc-button--filled'
                            : 'timeline-doc-button'
                        }
                        disabled={isUploading}
                        aria-label="Document toevoegen"
                        title={link.documentName || 'Document toevoegen'}
                        onClick={() => triggerDocumentUpload(link.trigger)}>
                        <span className="timeline-doc-button-label">
                          {isUploading
                            ? 'Uploaden...'
                            : link.documentName || 'Document toevoegen'}
                        </span>
                        <i
                          className={
                            link.documentName
                              ? 'ri-file-line'
                              : 'ri-upload-2-line'
                          }
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <Textbox
                        type="text"
                        inputMode="url"
                        aria-label="Link URL"
                        placeholder="/interne-pagina of https://..."
                        value={link.url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateLink(link.trigger, { url: e.target.value })
                        }
                      />
                    )}

                    <Textbox
                      aria-label="Link tekst"
                      value={link.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateLink(link.trigger, { title: e.target.value })
                      }
                    />
                  </div>

                  {kind === 'link' && (
                    <label className="timeline-link-newtab">
                      <input
                        type="checkbox"
                        checked={!!link.openInNewWindow}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateLink(link.trigger, {
                            openInNewWindow: e.target.checked,
                          })
                        }
                      />
                      <span>Openen in nieuw tabblad</span>
                    </label>
                  )}
                </div>
              );
            })}
            <SecondaryButton
              type="button"
              className="timeline-add-link-btn"
              onClick={addLink}>
              <i className="ri-add-line" aria-hidden="true" />
              Voeg een link toe
            </SecondaryButton>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes?.join(',') || '*'}
            className="timeline-file-input-hidden"
            onChange={handleFileUpload}
          />

          {formError && (
            <p className="timeline-dialog-error" role="alert">
              {formError}
            </p>
          )}

          <div className="timeline-dialog-actions">
            <Button
              type="button"
              disabled={!form.activeFrom}
              onClick={saveItem}>
              Opslaan
            </Button>
          </div>
        </div>
      </Dialog>

      <NotificationProvider />
    </div>
  );
};

export default TimelineField;
