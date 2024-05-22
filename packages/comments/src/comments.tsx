import React, { useState, useEffect, createContext } from 'react';
import './index.css';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../lib/has-role';
import { Banner } from '@openstad-headless/ui/src';
import { Spacer } from '@openstad-headless/ui/src';
import Comment from './parts/comment.js';
import CommentForm from './parts/comment-form.js';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Button, Paragraph, Heading3, Heading } from '@utrecht/component-library-react';
import { CommentFormProps } from './types/comment-form-props';

// This type holds all properties needed for this component to work
export type CommentsWidgetProps = BaseProps &
  ProjectSettingProps & {
    resourceId: string;
    resourceIdRelativePath?: string;
    title?: string;
    sentiment?: string;
    useSentiments?: Array<string>;
    emptyListText?: string;
    placeholder?: string;
    formIntro?: string;
    hideReplyAsAdmin?: boolean; // todo: wat is dit?
    canComment?: boolean,
    canLike?: boolean,
    canReply?: boolean,
    closedText?: string;
    requiredUserRole?: string,
    descriptionMinLength?: number,
    descriptionMaxLength?: number,
    type?: string | 'resource';
  } & Partial<Pick<CommentFormProps, 'formIntro' | 'placeholder'>>;

export const CommentWidgetContext = createContext<
  CommentsWidgetProps | undefined
>(undefined);

function Comments({
  title = '[[nr]] comments',
  sentiment = 'no sentiment',
  emptyListText = 'Nog geen reacties',
  placeholder = 'type hier uw reactie',
  formIntro = '',
  ...props
}: CommentsWidgetProps) {

  let resourceId = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

  let args = {
    title,
    sentiment,
    emptyListText,
    placeholder,
    formIntro,
    canComment: typeof props.comments?.canComment != 'undefined' ? props.comments.canComment : true,
    canLike: typeof props.comments?.canLike != 'undefined' ? props.comments.canLike : true,
    canReply: typeof props.comments?.canReply != 'undefined' ? props.comments.canReply : true,
    closedText: props.comments?.closedText || 'Het insturen van reacties is gesloten, u kunt niet meer reageren',
    requiredUserRole: props.comments?.requiredUserRole || 'member',
    descriptionMinLength: props.comments?.descriptionMinLength || 30,
    descriptionMaxLength: props.comments?.descriptionMaxLength || 500,
    ...props,
  } as CommentsWidgetProps;

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const { data: comments } = datastore.useComments({
    projectId: props.projectId,
    resourceId: resourceId,
    sentiment: args.sentiment,
    type: props.type,
  });

  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
    type: props.type,
  });

  const [canComment, setCanComment] = useState(args.canComment)
  useEffect(() => {
    if (!resource) return;
    let statuses = resource.statuses || [];
    for (let status of statuses) {
      if (status.extraFunctionality?.canComment === false) {
        setCanComment(false)
      }
    }
  }, [resource]);
  if (canComment === false) args.canComment = canComment;

  const { data: currentUser } = datastore.useCurrentUser({ ...args });

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
  console.log(props.type)

  return (
    <CommentWidgetContext.Provider value={args}>
      <section className="osc">
        <Heading3 className="comments-title">
          {comments && title.replace(/\[\[nr\]\]/, comments.length)}
          {!comments && title}
        </Heading3>

        {!args.canComment ? (
          <Banner>
            <Spacer size={2} />
            <Heading level={4} appearance='utrecht-heading-6'>{args.closedText}</Heading>
            <Spacer size={2} />
          </Banner>
        ) : null}

        {!args.canComment && hasRole(currentUser, 'moderator') ? (
          <Banner>
            <Heading level={4} appearance='utrecht-heading-6'>U kunt nog reageren vanwege uw rol als moderator</Heading>
            <Spacer size={2} />
          </Banner>
        ) : null }

        {args.canComment && !hasRole(currentUser, args.requiredUserRole) ? (
          <Banner className="big">
            <Heading level={4} appearance='utrecht-heading-6'>Inloggen om deel te nemen aan de discussie.</Heading>
            <Spacer size={1} />
            <Button
              appearance="primary-action-button"
              onClick={() => {
                // login
                if (args.login?.url) {
                  document.location.href = args.login.url;
                }
              }}
              type="button">
              Inloggen
            </Button>
          </Banner>
        ) : null}

        {/* {(args.canComment && hasRole(currentUser, args.requiredUserRole)) || hasRole(currentUser, 'moderator') ? ( */}
        {args.canComment ? (
          <div className="input-container">
            <CommentForm {...args} submitComment={submitComment} />
            <Spacer size={1} />
          </div>
        ) : null}

        <Spacer size={1} />

        {Array.isArray(comments) && comments.length === 0 ? (
          <Paragraph>{emptyListText}</Paragraph>
        ) : null}
        {(comments || []).map((comment: any, index: number) => {
          let attributes = { ...args, comment, submitComment };
          return <Comment {...attributes} key={index} />;
        })}
      </section>
    </CommentWidgetContext.Provider>
  );
}

Comments.loadWidget = loadWidget;

export { Comments };
