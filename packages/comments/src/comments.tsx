import React, { createContext } from 'react';
import './index.css';
import DataStore from '@openstad-headless/data-store/src';
import { Banner } from '@openstad-headless/ui/src';
import { Spacer } from '@openstad-headless/ui/src';
import Comment from './parts/comment.js';
import CommentForm from './parts/comment-form.js';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Paragraph, Heading4 } from '@utrecht/component-library-react';
import { CommentFormProps } from './types/comment-form-props';

// This type holds all properties needed for this component to work
export type CommentsWidgetProps = BaseProps &
  ProjectSettingProps & {
    resourceId: string;
    requiredUserRole?: string;
    userNameFields?: Array<string>;
    title?: string;
    sentiment?: string;
    emptyListText?: string;
    isVotingEnabled?: boolean;
    isReplyingEnabled?: boolean;
    isClosed?: boolean;
    isClosedText?: string;
    placeholder?: string;
    hideReplyAsAdmin?: boolean;
  } & Partial<Pick<CommentFormProps, 'formIntro' | 'placeholder'>>;

export const CommentWidgetContext = createContext<
  CommentsWidgetProps | undefined
>(undefined);

function Comments({
  title = '[[nr]] comments',
  requiredUserRole = 'member',
  userNameFields = [],
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

  const { data: comments } = datastore.useComments({
    projectId: props.projectId,
    resourceId: resourceId,
    sentiment: props.sentiment,
  });

  async function submitComment(formData: any) {
    const formDataCopy = { ...formData };

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
      <Heading4 className="comments-title">
        {comments &&(
          title.replace(/\[\[nr\]\]/, comments.length)
        )}
        {!comments && title}
      </Heading4>

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
          <Paragraph>{emptyListText}</Paragraph>
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
