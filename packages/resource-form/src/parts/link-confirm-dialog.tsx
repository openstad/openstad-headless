import {
  Button,
  Dialog,
  DialogDescription,
  DialogTitle,
  SecondaryButton,
} from '@openstad-headless/ui/src/index.js';
import RteContent from '@openstad-headless/ui/src/rte-formatting/rte-content';
import {
  FormField,
  FormLabel,
  Heading,
  Paragraph,
  Textarea,
} from '@utrecht/component-library-react';
import React, { useEffect, useState } from 'react';

import './link-confirm-dialog.css';
import { type LinkValue, linkKey, splitAddedLinks } from './link-selection';

const MAX_MESSAGE_LENGTH = 1000;

type LinkConfirmDialogProps = {
  open: boolean;
  added: LinkValue[];
  removed: LinkValue[];
  title?: string;
  description?: string;
  messageLabel?: string;
  chosenHeading?: string;
  removedHeading?: string;
  ownHeading?: string;
  revokeTitle?: string;
  revokeDescription?: string;
  revokeConfirmText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (messages: Record<string, string>) => void;
  onCancel: () => void;
};

export function LinkConfirmDialog({
  open,
  added,
  removed,
  title = 'Je gaat uitnodiging(en) versturen',
  description = 'Je hebt één of meerdere inzendingen gekozen om te tonen op jouw pagina. Daarom wordt er een uitnodiging verstuurd, zodat we zeker weten dat dat klopt. Als de ander de uitnodiging accepteert, wordt de koppeling getoond. Jij blijft de auteur van jouw inzending; niemand anders kan deze bewerken of verwijderen. Via jouw accountpagina kun je de status van je uitnodigingen bekijken.',
  messageLabel = 'Schrijf een toelichting',
  chosenHeading = 'Jouw keuze:',
  removedHeading = 'Deze koppelingen worden ingetrokken:',
  ownHeading = 'Deze eigen inzendingen worden direct gekoppeld:',
  revokeTitle = 'Je gaat koppelingen intrekken',
  revokeDescription = 'De gekozen koppelingen worden verwijderd. De eigenaren van de andere inzendingen krijgen daarvan bericht.',
  revokeConfirmText = 'Bevestigen',
  confirmText = 'Versturen',
  cancelText = 'Annuleren',
  onConfirm,
  onCancel,
}: LinkConfirmDialogProps) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const { others, own } = splitAddedLinks(added);
  const onlyRevoking = added.length === 0;

  useEffect(() => {
    if (open) setMessages({});
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
      className="osc-link-confirm-dialog">
      <div className="osc-link-confirm-dialog-body">
        <DialogTitle>{onlyRevoking ? revokeTitle : title}</DialogTitle>
        <DialogDescription>
          <RteContent
            content={onlyRevoking ? revokeDescription : description}
            unwrapSingleRootDiv={true}
          />
        </DialogDescription>

        {others.length > 0 ? (
          <>
            <Heading level={3} appearance="utrecht-heading-6">
              {chosenHeading}
            </Heading>
            <ul className="osc-link-confirm-list">
              {others.map((item) => {
                const key = linkKey(item);
                const textareaId = `osc-link-message-${key.replace(/[^a-z0-9-]/gi, '-')}`;
                return (
                  <li key={key}>
                    <Heading level={4} appearance="utrecht-heading-6">
                      {item.label}
                    </Heading>
                    <FormField type="text">
                      <Paragraph className="utrecht-form-field__label">
                        <FormLabel htmlFor={textareaId}>
                          {messageLabel}
                        </FormLabel>
                      </Paragraph>
                      <div className="utrecht-form-field__input">
                        <Textarea
                          id={textareaId}
                          maxLength={MAX_MESSAGE_LENGTH}
                          value={messages[key] || ''}
                          onChange={(
                            event: React.ChangeEvent<HTMLTextAreaElement>
                          ) =>
                            setMessages({
                              ...messages,
                              [key]: event.target.value,
                            })
                          }
                        />
                      </div>
                    </FormField>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {own.length > 0 ? (
          <>
            <Heading level={3} appearance="utrecht-heading-6">
              {ownHeading}
            </Heading>
            <ul className="osc-link-confirm-list">
              {own.map((item) => (
                <li key={linkKey(item)}>
                  <Paragraph>
                    <strong>{item.label}</strong>
                  </Paragraph>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {removed.length > 0 ? (
          <>
            <Heading level={3} appearance="utrecht-heading-6">
              {removedHeading}
            </Heading>
            <ul className="osc-link-confirm-list">
              {removed.map((item) => (
                <li key={linkKey(item)}>
                  <Paragraph>{item.label}</Paragraph>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="osc-link-confirm-actions">
          <Button type="button" onClick={() => onConfirm(messages)}>
            {onlyRevoking ? revokeConfirmText : confirmText}
          </Button>
          <SecondaryButton type="button" onClick={onCancel}>
            {cancelText}
          </SecondaryButton>
        </div>
      </div>
    </Dialog>
  );
}
