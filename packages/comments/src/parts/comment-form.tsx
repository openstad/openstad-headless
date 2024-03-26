import React, { useContext } from 'react';
import { Banner, Spacer } from '@openstad-headless/ui/src';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';
import Form from '@openstad-headless/form/src/form';
import type { CombinedFieldPropsWithType } from '@openstad-headless/form/src/props';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Heading6, Button } from '@utrecht/component-library-react';
import { CommentWidgetContext } from '../comments';
import { CommentFormProps } from '../types/comment-form-props';

function CommentForm({
  comment,
  descriptionMinLength = 30,
  descriptionMaxLength = 500,
  ...props
}: CommentFormProps) {
  const commentsContext = useContext(CommentWidgetContext);

  const args = {
    comment,
    descriptionMinLength,
    descriptionMaxLength,
    ...props,
  } as CommentFormProps;

  const datastore = new DataStore(args);
  const { data: currentUser } = datastore.useCurrentUser({ ...args });
  const formFields: Array<CombinedFieldPropsWithType> = [];

  formFields.push({
    type: 'text',
    title: '',
    variant: 'textarea',
    minCharacters: descriptionMinLength,
    maxCharacters: descriptionMaxLength,
    fieldRequired: false,
    requiredWarning: 'Dit veld is verplicht',
    fieldKey: 'description',
    placeholder: commentsContext?.placeholder,
    defaultValue: args.comment?.description,
  });

  if (
    typeof args.comment !== 'undefined' &&
    typeof args.comment.parentId !== 'undefined' &&
    args.comment.parentId !== null
  ) {
    formFields.push({
      type: 'hidden',
      fieldKey: 'parentId',
      defaultValue: args.comment.parentId.toString(),
    });
  }

  if (
    typeof args.comment !== 'undefined' &&
    typeof args.comment.id !== 'undefined'
  ) {
    formFields.push({
      type: 'hidden',
      fieldKey: 'id',
      defaultValue: args.comment.id.toString(),
    });
  }

  if (!commentsContext) {
    return null;
  }

  return (
    <div className="reaction-input-container">
      {commentsContext.formIntro && <p>{commentsContext.formIntro}</p>}
      <Spacer size={1} />

      {!hasRole(currentUser, 'member') ? ( // todo: args.requiredUserRole \
        <Banner className="big">
          <Heading6>Inloggen om deel te nemen aan de discussie.</Heading6>
          <Spacer size={1} />
          <Button
            appearance="primary-action-button"
            onClick={() => {
              // login
              if (commentsContext?.login?.url) {
                document.location.href = commentsContext.login.url;
              }
            }}
            type="button">
            Inloggen
          </Button>
        </Banner>
      ) : (
        <>
          {!hasRole(currentUser, 'moderator') &&
          !commentsContext.isReplyingEnabled ? (
            <Banner className="big">
              <Spacer size={2} />
              <Heading6>
                De reactiemogelijkheid is gesloten, u kunt niet meer reageren
              </Heading6>
              <Spacer size={2} />
            </Banner>
          ) : null}

          {hasRole(currentUser, 'moderator') &&
          !commentsContext.isReplyingEnabled &&
          !commentsContext.hideReplyAsAdmin ? (
            <>
              <Banner>
                <Spacer size={2} />
                <Heading6>
                  Reageren is gesloten, maar je kunt nog reageren vanwege je rol
                  als moderator
                </Heading6>
                <Spacer size={2} />
              </Banner>
              <Spacer size={2} />
            </>
          ) : null}
        </>
      )}

      {(hasRole(currentUser, 'member') && commentsContext.isReplyingEnabled) ||
      hasRole(currentUser, 'moderator') ? (
        <Form
          fields={formFields}
          submitHandler={props.submitComment}
          submitText="Verstuur"
          title=""
        />
      ) : null}
    </div>
  );
}

export { CommentForm as default, CommentForm };
