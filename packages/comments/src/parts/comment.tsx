import React from 'react';
import '../index.css';
import { Fragment, useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { GhostButton, Spacer } from '@openstad-headless/ui/src';
import CommentPropsType from '../types/comments.ts';
import CommentForm from './comment-form.js';
import { DropDownMenu } from '@openstad-headless/ui/src';
import hasRole from '../../../lib/has-role';

function Comment({
  // comment = {},
  isClosed = false,
  isVotingEnabled = true,
  isReplyingEnabled = true,
  requiredUserRole = 'member',
  userNameFields = ['displayName'],
  ...props
}: CommentPropsType) {

  const datastore = new DataStore(props);
  const [currentUser, currentUserError, currentUserIsLoading] = datastore.useCurrentUser({ ...props });

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
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return props.comment.can && props.comment.can.reply;
  }

  function canLike() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return hasRole(currentUser, requiredUserRole);
  }

  function canEdit() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return props.comment.can && props.comment.can.edit;
  }

  function canDelete() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return props.comment.can && props.comment.can.delete;
  }

  return (
    <Fragment>
      <section className="comment-item-header">
        <h6 className="reaction-name">{props.comment.user && props.comment.user.displayName} {/* todo: gebruik de meegstuurde param */}</h6>
        {canEdit() || canDelete() ? (
          <DropDownMenu
            items={[
              { label: 'Bewerken', onClick: () => toggleEditForm() },
              { label: 'Verwijderen', onClick: () => { if (confirm('Weet u het zeker?')) props.comment.delete(props.id); } },
            ]}>
            <GhostButton icon="ri-more-fill"></GhostButton>
          </DropDownMenu>
        ) : null}
      </section>

      {editMode ? (
        <CommentForm {...props} submitComment={e => { props.submitComment(e); toggleEditForm() }} />
      ) : (
        <p>{props.comment.description}</p>
      )}

      {!props.comment.parentId ? (
        <section className="comment-item-footer">
          <p className="strong">{props.comment.createDateHumanized}</p>
          {isVotingEnabled ?
            canLike() ?
              (
                <GhostButton icon="ri-thumb-up-line" onClick={() => props.comment.submitLike()}>Mee eens (<span>{props.comment.yes || 0}</span>)</GhostButton>
              ) : (
                <GhostButton icon="ri-thumb-up-line">Mee eens (<span>{props.comment.yes || 0}</span>)</GhostButton>
              )
            :
            null}
          {canReply() ? (
            <GhostButton onClick={() => toggleReplyForm()}>
              Reageren
            </GhostButton>
          ) : null}
        </section>
      ) : null}

      {props.comment.replies && props.comment.replies.map((reply, index) => {
        return (
          <div className="reaction-container" key={index}>
            <Comment
              {...props}
              comment={reply}
            />
          </div>
        );
      })}

      {isReplyFormActive ? (
        <div className="reaction-container">
          <div className="input-container">
            <CommentForm {...props} comment={{ parentId: props.comment.id }} submitComment={e => { props.submitComment(e); toggleReplyForm() }} />
            <Spacer size={1} />
          </div>
        </div>
      ) : null}

    </Fragment>
  );
}

export {
  Comment as default,
  Comment,
}


