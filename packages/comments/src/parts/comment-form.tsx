import React from 'react';
import { Banner, Input, Spacer } from '@openstad-headless/ui/src';
import { SecondaryButton } from '@openstad-headless/ui/src/button';
import { CommentPropsType } from '../types/index';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';

function CommentForm({
  comment = {},
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
  const [currentUser, currentUserError, currentUserIsLoading] =
    datastore.useCurrentUser({ ...args });

  function canSubmit() {
    return true;
  }

  return (
    <div className="reaction-input-container">
      <form onSubmit={args.submitComment}>
        {args.formIntro ? <p>{args.formIntro}</p> : null}

        {args.comment?.parentId ? (
          <input
            type="hidden"
            defaultValue={args.comment.parentId}
            name="parentId"
          />
        ) : null}

        {args.comment?.id ? (
          <input type="hidden" defaultValue={args.comment.id} name="id" />
        ) : null}

        <input type="hidden" defaultValue={args.sentiment} name="sentiment" />

        {hasRole(currentUser, 'member') ? ( // todo: args.requiredUserRole werkt nog niet
          <>
            <Input
              name="description"
              placeholder={args.placeholder}
              defaultValue={args.comment?.description}
            />
            <Spacer size={0.5} />
            <SecondaryButton disabled={!canSubmit()}>Verstuur</SecondaryButton>
          </>
        ) : (
          <Banner>
            <SecondaryButton
              type="button"
              onClick={() => {
                // login
                document.location.href = args.login.url;
              }}>
              Inloggen
            </SecondaryButton>
          </Banner>
        )}
      </form>
    </div>
  );
}

export { CommentForm as default, CommentForm };
