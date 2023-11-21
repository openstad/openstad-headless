import React from 'react';
import '../index.css';
import { Fragment, useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { GhostButton } from '@openstad-headless/ui/src';
import { Reaction } from '../types/index.js';
import CommentPropsType from '../types/comments.ts';
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

  // console.log(props);

  const datastore = new DataStore(props);
  const [currentUser, currentUserError, currentUserIsLoading] = datastore.useCurrentUser({ ...props });

  const [showInputFieldOnComment, setShowing] = useState<boolean>();
  const [isMenuActive, setIsMenuActive] = useState<boolean>(false);
  const [isReplyFromActive, setIsReplyFromActive] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const userName = comment.user && comment.user.displayName; // todo: gebruik de meegstuurde param

  function toggleReplyForm() {
    setIsReplyFromActive(!isReplyFromActive);
  }

  function toggleEditForm(what) {
    setEditMode(!editMode);
  }

  function canReply() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return comment.can && comment.can.reply;
  }

  function canLike() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return hasRole(currentUser, requiredUserRole);
  }

  function canEdit() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return comment.can && comment.can.edit;
  }

  function canDelete() {
    if (props.isClosed) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return comment.can && comment.can.delete;
  }

  return (
    <Fragment>
      <section className="comment-item-header">
        <h6 className="reaction-name">{comment.user && comment.user.displayName} {/* todo: gebruik de meegstuurde param */}</h6>
        {canEdit() || canDelete() ? (
          <DropDownMenu
            items={[
              { label: 'Bewerken', onClick: () => { () => toggleEditForm() } },
              { label: 'Verwijderen', onClick: () => { if (confirm('Weet u het zeker?')) comment.delete(props.id); } },
            ]}>
            <GhostButton icon="ri-more-fill"></GhostButton>
          </DropDownMenu>
        ) : null}
      </section>
      <p>{comment.description}</p>
      <section className="comment-item-footer">
        <p className="strong">{comment.createDateHumanized}</p>
        {isVotingEnabled ?
          canLike() ?
            (
              <GhostButton icon="ri-thumb-up-line" onClick={() => props.submitLike()}>Mee eens (<span>{props.yes || 0}</span>)</GhostButton>
            ) : (
              <GhostButton icon="ri-thumb-up-line">Mee eens (<span>{props.yes || 0}</span>)</GhostButton>
            )
          :
          null}
        {canReply() ? (
          <GhostButton onClick={() => toggleReplyForm()}>
            Reageren
          </GhostButton>
        ) : null}
      </section>
      {showInputFieldOnComment ? (
        <CommentForm resourceId={resourceId} parentCommentId={comment.id} />
      ) : null}

      {comment.reactionsOnComment && comment.reactionsOnComment.map((a) => {
        return (
          <div className="reaction-container">
            <section className="comment-item-header">
              <h6 className="reaction-name">{a.name}</h6>
              {canEdit && canEdit(a) ? (
                <GhostButton icon="ri-more-fill"></GhostButton>
              ) : null}
            </section>
            <p>{a.description}</p>
            <section className="comment-item-footer">
              <p className="strong">23 mei 1993 11:01</p>
            </section>
          </div>
        );
      })}
    </Fragment>
  );
}

export {
  Comment as default,
  Comment,
}


