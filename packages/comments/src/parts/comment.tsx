import React from 'react';
import '../index.css';
import { Fragment, useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { GhostButton, Spacer } from '@openstad-headless/ui/src';
import { CommentPropsType } from '../types/index';
import CommentForm from './comment-form.js';
import { DropDownMenu } from '@openstad-headless/ui/src';
import hasRole from '../../../lib/has-role';

function Comment({
  comment = {},
  isClosed = false,
  isVotingEnabled = true,
  isReplyingEnabled = true,
  requiredUserRole = 'member',
  userNameFields = ['displayName'],
  ...props
}: CommentPropsType) {
  const args = {
    comment,
    isClosed,
    isVotingEnabled,
    isReplyingEnabled,
    requiredUserRole,
    userNameFields,
    ...props,
  } as CommentPropsType;

  const datastore = new DataStore(args);
  const [currentUser, currentUserError, currentUserIsLoading] =
    datastore.useCurrentUser({ ...args });

  const [isReplyFormActive, setIsReplyFormActive] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  function toggleReplyForm() {
    // todo: scrollto
    setIsReplyFormActive(!isReplyFormActive);
  }

  function toggleEditForm() {
    setEditMode(!editMode);
  }

  function canReply() {
    if (args.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.reply;
  }

  function canLike() {
    if (args.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return hasRole(currentUser, requiredUserRole);
  }

  function canEdit() {
    if (args.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.edit;
  }

  function canDelete() {
    if (args.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.delete;
  }

  return (
    <Fragment>
      <section className="comment-item-header">
        <h6 className="reaction-name">
          {args.comment.user && args.comment.user.displayName}{' '}
          {/* todo: gebruik de meegstuurde param */}
        </h6>
        {canEdit() || canDelete() ? (
          <DropDownMenu
            items={[
              { label: 'Bewerken', onClick: () => toggleEditForm() },
              {
                label: 'Verwijderen',
                onClick: () => {
                  if (confirm('Weet u het zeker?'))
                    args.comment.delete(args.id);
                },
              },
            ]}>
            <GhostButton icon="ri-more-fill"></GhostButton>
          </DropDownMenu>
        ) : null}
      </section>

      {editMode ? (
        <CommentForm
          {...args}
          submitComment={(e) => {
            args.submitComment(e);
            toggleEditForm();
          }}
        />
      ) : (
        <p>{args.comment.description}</p>
      )}

      {!args.comment.parentId ? (
        <section className="comment-item-footer">
          <p className="strong">{args.comment.createDateHumanized}</p>
          {isVotingEnabled ? (
            canLike() ? (
              <GhostButton
                icon="ri-thumb-up-line"
                onClick={() => args.comment.submitLike()}>
                Mee eens (<span>{args.comment.yes || 0}</span>)
              </GhostButton>
            ) : (
              <GhostButton icon="ri-thumb-up-line">
                Mee eens (<span>{args.comment.yes || 0}</span>)
              </GhostButton>
            )
          ) : null}
          {canReply() ? (
            <GhostButton onClick={() => toggleReplyForm()}>
              Reageren
            </GhostButton>
          ) : null}
        </section>
      ) : null}

      {args.comment.replies &&
        args.comment.replies.map((reply, index) => {
          return (
            <div className="reaction-container" key={index}>
              <Comment {...args} comment={reply} />
            </div>
          );
        })}

      {isReplyFormActive ? (
        <div className="reaction-container">
          <div className="input-container">
            <CommentForm
              {...args}
              comment={{ parentId: args.comment.id }}
              submitComment={(e) => {
                args.submitComment(e);
                toggleReplyForm();
              }}
            />
            <Spacer size={1} />
          </div>
        </div>
      ) : null}
    </Fragment>
  );
}

export { Comment as default, Comment };
