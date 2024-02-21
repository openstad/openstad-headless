import React from 'react';
import { Banner, Input, Spacer } from '@openstad-headless/ui/src';
import { SecondaryButton, Button } from '@openstad-headless/ui/src/button';
import { CommentPropsType } from '../types/index';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';

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

  function canSubmit() {
    return true;
  }

  return (
    <div className="reaction-input-container">
      <form onSubmit={args.submitComment}>
        {args.formIntro ? <p>{args.formIntro}</p> : null}
        <Spacer size={1} />
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
          <>
            <Input
              className="comment-description-inputfield"
              name="description"
              placeholder={args.placeholder}
              defaultValue={args.comment?.description}
            />
            <Spacer size={0.5} />
            <SecondaryButton disabled={!canSubmit()}>Verstuur</SecondaryButton>
          </>
        ) : null}
      </form>
    </div>
  );
}

export { CommentForm as default, CommentForm };
