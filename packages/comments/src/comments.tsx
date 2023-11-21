import React from 'react';
import './index.css';
import { Reaction } from './types/index.js';
import { useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { Button, Spacer } from '@openstad-headless/ui/src';
import { Banner } from '@openstad-headless/ui/src';
import Comment from './parts/comment.js';
import CommentForm from './parts/comment-form.js';
import CommentsPropsType from './types/comments-props';
import hasRole from '../../lib/has-role';

function Comments({
  requiredUserRole = 'member',
  title = '[[nr]] comments',
  emptyListText = 'Nog geen reacties',
  isVotingEnabled = true,
  isReplyingEnabled = true,
  isClosed = false,
  isClosedText = 'Het inzenden van reacties is niet langer mogelijk',
  ...props
}: CommentsPropsType) {

  console.log(props.ideaId) // deze lijkt ok
  console.log(props.title) // maar deze geeft een type error

  const [loggedIn, setLoggedIn] = useState<boolean>(true);

  const datastore = new DataStore(props);

  const [currentUser, currentUserError, currentUserIsLoading] = datastore.useCurrentUser({ ...props });
  const [comments, commentsError, commentsIsLoading] = datastore.useComments({ ...props });

  async function submitComment(e) {

    setSubmitError(null)
    e.preventDefault();

    let formData = new FormData(e.target);
    formData = Object.fromEntries(formData.entries());

    formData.ideaId = props.ideaId;

    try {
      if (formData.id) {
        let comment = comments.find(c => c.id == formData.id);
        await comment.update(formData)
      } else {
        await comments.create(formData)
      }
    } catch (err) {
      console.log(err);
      setSubmitError(err)
    }

  }

  let [submitError, setSubmitError] = useState();

  return (
    <section>
      <h4 className="comments-title">{title.replace(/\[\[nr\]\]/, comments.length)}</h4>

      {props.isClosed ? (
        <Banner>
          <p>{closedText}</p>
        </Banner>
      ) : (
        <div className="input-container">
          <CommentForm resourceId={props.ideaId} />
          <Spacer size={1} />
        </div>
      )}

      <Spacer size={1} />

      {(comments || []).map((comment, index) => {
        let attributes = { ...props, comment, currentUser, submitComment };
        return (
          <Comment
            {...attributes}
            key={index}
          />
        )
      })}
    </section>
  );
}

export {
  Comments as default,
  Comments,
}
