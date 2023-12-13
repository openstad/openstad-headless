import React from 'react';
import './index.css';
import { useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Banner } from '@openstad-headless/ui/src';
import Comment from './parts/comment.js';
import CommentForm from './parts/comment-form.js';
import CommentsPropsType from './types/index';
import loadWidget from '@openstad-headless/lib/load-widget';

import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

export type CommentsWidgetProps = BaseProps &
  ProjectSettingProps &
  CommentsPropsType;

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
  const args = {
    requiredUserRole,
    title,
    emptyListText,
    isVotingEnabled,
    isReplyingEnabled,
    isClosed,
    isClosedText,
    ...props,
  } as CommentsPropsType;

  const datastore = new DataStore(args);

  const [currentUser, currentUserError, currentUserIsLoading] =
    datastore.useCurrentUser({ ...args });
  const [comments, commentsError, commentsIsLoading] = datastore.useComments({
    ...args,
  });

  async function submitComment(e) {
    setSubmitError(undefined);
    e.preventDefault();

    let formData = new FormData(e.target);
    formData = Object.fromEntries(formData.entries());

    formData.ideaId = args.ideaId;

    try {
      if (formData.id) {
        let comment = comments.find((c) => c.id == formData.id);
        if (formData.parentId) {
          let parent = comments.find((c) => c.id == formData.parentId);
          comment = parent.replies.find((c) => c.id == formData.id);
        }
        await comment.update(formData);
      } else {
        await comments.create(formData);
      }
    } catch (err) {
      console.log(err);
      setSubmitError(err);
    }
  }

  let [submitError, setSubmitError] = useState();

  return (
    <section className="osc">
      <h4 className="comments-title">
        {title.replace(/\[\[nr\]\]/, comments.length)}
      </h4>

      {args.isClosed ? (
        <Banner>
          <p>{args.closedText}</p>
        </Banner>
      ) : (
        <div className="input-container">
          <CommentForm submitComment={submitComment} {...args} />
          <Spacer size={1} />
        </div>
      )}

      <Spacer size={1} />

      {(comments || []).map((comment, index) => {
        let attributes = { ...args, comment, submitComment };
        return <Comment {...attributes} key={index} />;
      })}
    </section>
  );
}

Comments.loadWidget = loadWidget;

export { Comments };
