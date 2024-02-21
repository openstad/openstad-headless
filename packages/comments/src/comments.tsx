import React from 'react';
import './index.css';
import DataStore from '@openstad-headless/data-store/src';
import { Banner } from '@openstad-headless/ui/src';
import { Spacer } from '@openstad-headless/ui/src';
import Comment from './parts/comment.js';
import CommentForm from './parts/comment-form.js';
import { CommentPropsType } from './types/index';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

export type CommentsWidgetProps = BaseProps &
  ProjectSettingProps &
  CommentPropsType;

function Comments({
  requiredUserRole = 'member',
  title = '[[nr]] comments',
  emptyListText = 'Nog geen reacties',
  isVotingEnabled = true,
  isReplyingEnabled = true,
  isClosed = false,
  isClosedText = 'Het inzenden van reacties is niet langer mogelijk',
  ...props
}: CommentsWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId = urlParams.get('openstadResourceId') || props.resourceId;

  const args = {
    requiredUserRole,
    title,
    emptyListText,
    isVotingEnabled,
    isReplyingEnabled,
    isClosed,
    isClosedText,
    ...props,
  } as CommentsWidgetProps;

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const [currentUser, currentUserError, currentUserIsLoading] =
    datastore.useCurrentUser({ ...args });
  const [comments, commentsError, commentsIsLoading] = datastore.useComments({
    projectId: props.projectId,
    resourceId: resourceId || props.resourceId,
    sentiment: props.sentiment,
  });

  async function submitComment(formData: any) {
    const formDataCopy = { ...formData }

    formDataCopy.resourceId = `${resourceId}`;

    try {
      if (formDataCopy.id) {
        let comment = comments.find((c: any) => c.id == formDataCopy.id);
        if (formDataCopy.parentId) {
          let parent = comments.find((c: any) => c.id == formDataCopy.parentId);
          comment = parent.replies.find((c: any) => c.id == formDataCopy.id);
        }
        await comment.update(formDataCopy);
      } else {
        await comments.create(formDataCopy);
      }
    } catch (err: any) {
      console.log(err);
    }
  }

  return (
    <section className="osc">
      <h4 className="comments-title">
        {title.replace(/\[\[nr\]\]/, comments.length)}
      </h4>

      {args.isClosed ? (
        <Banner>
          <p>{args.isClosedText}</p>
        </Banner>
      ) : (
        <div className="input-container">
          <CommentForm {...args} submitComment={submitComment} />
          <Spacer size={1} />
        </div>
      )}

      <Spacer size={1} />

      {Array.isArray(comments) && comments.length === 0 ? (
        <p>{emptyListText}</p>
      ) : null}
      {(comments || []).map((comment: any, index: number) => {
        let attributes = { ...args, comment, submitComment };
        return <Comment {...attributes} key={index} />;
      })}
    </section>
  );
}

Comments.loadWidget = loadWidget;

export { Comments };
