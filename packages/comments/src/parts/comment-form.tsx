import React from 'react';
import { Banner, Spacer } from '@openstad-headless/ui/src';
import { Button } from '@openstad-headless/ui/src/button';
import { CommentPropsType } from '../types/index';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';
import Form from "@openstad-headless/form/src/form";
import {CombinedFieldPropsWithType, FieldProps} from "@openstad-headless/form/src/props";

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

  const formFields : CombinedFieldPropsWithType[] = [
      {
        type: 'text',
        title: '',
        minCharacters: descriptionMinLength,
        maxCharacters: descriptionMaxLength,
        fieldRequired: true,
        requiredWarning: "Dit veld is verplicht",
        fieldKey: "description",
        placeholder: args.placeholder,
        defaultValue: args.comment?.description,
    },
    {
        type: 'hidden',
        fieldKey: "sentiment",
        defaultValue: args.sentiment,
    }
  ];

  if (typeof (args.comment) !== 'undefined' &&  typeof (args.comment.parentId) !== 'undefined' ) {
    formFields.push({
        type: 'hidden',
        fieldKey: "parentId",
        defaultValue: args.comment.parentId.toString(),
    });
  }

  if (typeof (args.comment) !== 'undefined' &&  typeof (args.comment.id) !== 'undefined' ) {
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
            <h6>Inloggen om deel te nemen aan de discussie.</h6>
            <Spacer size={1} />
            <Button
              type="button"
              onClick={() => {
                // login
                document.location.href = args.login.url;
              }}>
              Inloggen
            </Button>
          </Banner>
        ) : (
          <>
            {!hasRole(currentUser, 'moderator') && !props.isReplyingEnabled ? (
              <Banner className="big">
                <Spacer size={2} />
                <h6>
                  De reactiemogelijkheid is gesloten, u kunt niet meer reageren
                </h6>
                <Spacer size={2} />
              </Banner>
            ) : null}

            {hasRole(currentUser, 'moderator') &&
            !props.isReplyingEnabled &&
            !props.hideReplyAsAdmin ? (
              <>
                <Banner>
                  <Spacer size={2} />
                  <h6>
                    Reageren is gesloten, maar je kunt nog reageren vanwege je
                    rol als moderator
                  </h6>
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
