import React from 'react';
import { Input, Spacer } from '@openstad-headless/ui/src';
import { useState } from 'react';
import { SecondaryButton } from '@openstad-headless/ui/src/button';
import CommentFormPropsType from '../types/comment-form-props.ts';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';

function CommentForm({
  // comment = {},
  descriptionMinLength = 30,
  descriptionMaxLength = 500,
  placeholder = 'Type hier je reactie',
  formIntro = '',
  requiredUserRole = 'member',
  ...props
}: CommentFormPropsType) {

  const datastore = new DataStore(props);
  const [currentUser, currentUserError, currentUserIsLoading] = datastore.useCurrentUser({ ...props });

  function canSubmit() {
    return true;
  }

  return (
    <div className="reaction-input-container">

      <form onSubmit={props.submitComment}>

        {props.formIntro ? (
          <p>{props.formIntro}</p>
        ) : null}

        {props.comment?.parentId ? (
          <input type="hidden" defaultValue={props.comment.parentId} name="parentId" />
        ) : null}

        {props.comment?.id ? (
          <input type="hidden" defaultValue={props.comment.id} name="id" />
        ) : null}

        <input type="hidden" defaultValue={props.sentiment} name="sentiment" />

        <Input
          name="description"
          placeholder={props.placeholder}
          defaultValue={props.comment?.description}
        />
        <Spacer size={0.5} />
        {hasRole(currentUser, 'member') ? ( // todo: props.requiredUserRole werkt nog niet
          <SecondaryButton
            disabled={!canSubmit()}>
            Verstuur
          </SecondaryButton>
        ) : (
          <SecondaryButton
            type="button"
            onClick={() => {
              // login
              document.location.href = props.login.url;
            }}>
            Inloggen
          </SecondaryButton>
        )}
      </form>

    </div>
  );
}

export {
  CommentForm as default,
  CommentForm,
}
