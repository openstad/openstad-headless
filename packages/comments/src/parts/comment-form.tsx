import React from 'react';
import { Banner, Spacer } from '@openstad-headless/ui/src';
import type { CommentPropsType } from '../types/index';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';
import Form from "@openstad-headless/form/src/form";
import type { CombinedFieldPropsWithType } from "@openstad-headless/form/src/props";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading6, Button } from "@utrecht/component-library-react";

function CommentForm({
  comment,
  descriptionMinLength = 30,
  descriptionMaxLength = 500,
  placeholder = 'Type hier je reactie',
  requiredUserRole = 'member',
  ...props
}: CommentPropsType) {
  const args = {
    comment,
    descriptionMinLength,
    descriptionMaxLength,
    placeholder,
    requiredUserRole,
    ...props,
  } as CommentPropsType;

  const datastore = new DataStore(args);
  const {
    data: currentUser,
    error: currentUserError,
    isLoading: currentUserIsLoading,
  } = datastore.useCurrentUser({ ...args });

  const formFields: Array<CombinedFieldPropsWithType> = [];

  formFields.push({
    type: 'text',
    title: '',
    variant: 'textarea',
    minCharacters: descriptionMinLength,
    maxCharacters: descriptionMaxLength,
    fieldRequired: false,
    requiredWarning: "Dit veld is verplicht",
    fieldKey: "description",
    placeholder: args.placeholder,
    defaultValue: args.comment?.description,
  });

  if (typeof (args.comment) !== 'undefined' && typeof (args.comment.parentId) !== 'undefined' && args.comment.parentId !== null) {
    formFields.push({
      type: 'hidden',
      fieldKey: "parentId",
      defaultValue: args.comment.parentId.toString(),
    });
  }

  if (typeof (args.comment) !== 'undefined' && typeof (args.comment.id) !== 'undefined') {
    formFields.push({
      type: 'hidden',
      fieldKey: "id",
      defaultValue: args.comment.id.toString(),
    });
  }


  return (
    <div className="reaction-input-container">
        {args.formIntro ? <p>{args.formIntro}</p> : null}
        <Spacer size={1} />

        {!hasRole(currentUser, 'member') ? ( // todo: args.requiredUserRole \
          <Banner className="big">
            <Heading6>Inloggen om deel te nemen aan de discussie.</Heading6>
            <Spacer size={1} />
            <Button
              appearance="primary-action-button"
              onClick={() => {
                // login
                document.location.href = args.login.url;
              }}
              type="button">
              Inloggen
            </Button>
          </Banner>
        ) : (
          <>
            {!hasRole(currentUser, 'moderator') && !props.isReplyingEnabled ? (
              <Banner className="big">
                <Spacer size={2} />
                <Heading6>
                  De reactiemogelijkheid is gesloten, u kunt niet meer reageren
                </Heading6>
                <Spacer size={2} />
              </Banner>
            ) : null}

            {hasRole(currentUser, 'moderator') &&
            !props.isReplyingEnabled &&
            !props.hideReplyAsAdmin ? (
              <>
                <Banner>
                  <Spacer size={2} />
                  <Heading6>
                    Reageren is gesloten, maar je kunt nog reageren vanwege je
                    rol als moderator
                  </Heading6>
                  <Spacer size={2} />
                </Banner>
                <Spacer size={2} />
              </>
            ) : null}
          </>
        )}

        {(hasRole(currentUser, 'member') && props.isReplyingEnabled) ||
        hasRole(currentUser, 'moderator') ? (
          <Form fields={formFields} submitHandler={args.submitComment} submitText="Verstuur" title=""/>
        ) : null}
    </div>
  );
}

export { CommentForm as default, CommentForm };
