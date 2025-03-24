import React, { useState, useEffect, createContext } from 'react';
import './index.css';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../lib/has-role';
import {Banner, Paginator} from '@openstad-headless/ui/src';
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
import {Filters} from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";
import NotificationService from "../../lib/NotificationProvider/notification-service";
import NotificationProvider from "../../lib/NotificationProvider/notification-provider";

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
    showForm?: boolean,
    closedText?: string;
    requiredUserRole?: string,
    descriptionMinLength?: number,
    descriptionMaxLength?: number,
    selectedComment?: Number | undefined;
    customTitle?: string;
    onlyIncludeTags?: string;
    loginText?: string;
    defaultSorting?: string;
    sorting?: Array<{ value: string; label: string }>;
    setRefreshComments?: React.Dispatch<any>;
    itemsPerPage?: number;
    displayPagination?: boolean;
    onGoToLastPage?: (goToLastPage: () => void) => void;
    subWidgetKey?: string;
  } & Partial<Pick<CommentFormProps, 'formIntro' | 'placeholder'>>;

export const CommentWidgetContext = createContext<
    (CommentsWidgetProps & {setRefreshComments: React.Dispatch<React.SetStateAction<boolean>> }) | undefined
>(undefined);

function CommentsInner({
  title,
  sentiment,
  emptyListText,
  placeholder,
  formIntro,
  selectedComment,
  loginText,
  itemsPerPage,
  onGoToLastPage,
  displayPagination = false,
  setRefreshComments: parentSetRefreshComments = () => {}, // parent setter as fallback
  ...props
}: CommentsWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0); // Key for SWR refresh
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState<number>(displayPagination ? itemsPerPage || 9999 : 9999 );

  const goToLastPage = () => {
    if (totalPages > 0 && displayPagination) {
      setPage(totalPages - 1);
    }
  };

  useEffect(() => {
    if (onGoToLastPage) {
      onGoToLastPage(goToLastPage);
    }
  }, [onGoToLastPage, totalPages]);

  const refreshComments = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment the key to trigger a refresh
    parentSetRefreshComments((prev: boolean) => !prev); // Trigger any parent-level refresh logic
  };

  let resourceId = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

  let args = {
    parentSetRefreshComments,
    title,
    sentiment,
    emptyListText,
    placeholder,
    formIntro,
    canComment: typeof props.comments?.canComment != 'undefined' ? props.comments.canComment : true,
    canLike: typeof props.comments?.canLike != 'undefined' ? props.comments.canLike : true,
    canReply: typeof props.comments?.canReply != 'undefined' ? props.comments.canReply : true,
    showForm: typeof props.showForm != 'undefined' ? props.showForm : true,
    closedText: props.comments?.closedText || 'Het insturen van reacties is gesloten, u kunt niet meer reageren',
    requiredUserRole: props.comments?.requiredUserRole || 'member',
    descriptionMinLength: props.comments?.descriptionMinLength || 30,
    descriptionMaxLength: props.comments?.descriptionMaxLength || 500,
    adminLabel: props.comments?.adminLabel || 'admin',
    ...props,
  } as CommentsWidgetProps;

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const useCommentsData = {
    projectId: props.projectId,
    resourceId: resourceId,
    sentiment: args.sentiment,
    onlyIncludeTagIds: props.onlyIncludeTags || undefined,
    refreshKey
  };

  const { data: comments } = datastore.useComments(useCommentsData);

  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const [sort, setSort] = useState<string | undefined>(
    props.defaultSorting || "createdAt_asc"
  );

  const [canComment, setCanComment] = useState(args.canComment)
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

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

  const notifySuccess = () => NotificationService.addNotification("Reactie succesvol geplaatst", "success");
  const notifyFailed = () => NotificationService.addNotification("Reactie plaatsen mislukt", "error");

  const defaultSetRefreshComments = () => {};

  async function submitComment(formData: any) {
    setDisableSubmit(true);
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

        notifySuccess();
        setDisableSubmit(false);
      } else {
        await comments.create(formDataCopy);

        notifySuccess();
        setDisableSubmit(false);
      }

      refreshComments();
    } catch (err: any) {
      console.log(err);
      notifyFailed();
      setDisableSubmit(false);
    }
  }

  useEffect(() => {
    if (comments) {
      let count = comments.length || 0;

      for (let comment of comments) {
        if (!comment?.replies) continue;

        count += comment.replies.length;
      }

      setCommentCount(count);
    }
  }, [comments]);

  useEffect(() => {
    if (comments && Array.isArray(comments) && comments.length > 0 && displayPagination) {
      setTotalPages(Math.ceil(comments.length / pageSize));
    }
  }, [comments, pageSize]);

    return (
    <CommentWidgetContext.Provider value={{ ...args, setRefreshComments: refreshComments || defaultSetRefreshComments }}>
      <section className="osc">
        <Heading3 className="comments-title">
          {comments && title?.replace(/\[\[nr\]\]/, commentCount.toString()) }
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
        ) : null}

        {args.canComment && !hasRole(currentUser, args.requiredUserRole) ? (
            <>
              {formIntro && (
                <>
                  <p>{formIntro}</p>
                  <Spacer size={1} />
                </>
              )}
              <Banner className="big">
                <Heading level={4} appearance='utrecht-heading-6'>{ loginText }</Heading>
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
            </>
        ) : null}

        {/* {(args.canComment && hasRole(currentUser, args.requiredUserRole)) && type === 'resource' || hasRole(currentUser, 'moderator') && type === 'resource' ? ( */}
        {args.canComment && args.showForm && hasRole(currentUser, args.requiredUserRole) ? (
          <div className="input-container">
            <CommentForm {...args} disableSubmit={disableSubmit} submitComment={submitComment} />
            <Spacer size={1} />
          </div>
        ) : null}

        <Spacer size={1} />

        {Array.isArray(comments) && comments.length === 0 ? (
          <Paragraph>{emptyListText}</Paragraph>
        ) : ((props.sorting || []).length > 0 && datastore) ? (
          <>
            <Filters
              className="osc-flex-columned"
              dataStore={datastore}
              sorting={props.sorting || []}
              displaySorting={true}
              defaultSorting={props.defaultSorting || 'createdAt_asc'}
              onUpdateFilter={(f) => {
                if (['createdAt_desc', 'createdAt_asc'].includes(f.sort)) {
                  setSort(f.sort);
                }
              }}
              applyText={'Toepassen'}
              resources={undefined}
              displaySearch={false}
              displayTagFilters={false}
              searchPlaceholder={''}
              resetText={'Reset'}
            />

            <Spacer size={1} />
          </>
          ) : null
        }
        {(comments || [])
          ?.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sort === 'createdAt_desc' ? dateB - dateA : dateA - dateB;
          })
          .slice(page * pageSize, (page + 1) * pageSize)
          ?.map((comment: any, index: number) => {

          let attributes = { ...args, comment, submitComment, setRefreshComments: refreshComments };
          return <Comment {...attributes} disableSubmit={disableSubmit} index={index} key={index} selected={selectedComment === comment?.id} />;
        })}

        {displayPagination && (
          <>
            <Spacer size={4} />
            <div className="osc-comments-paginator col-span-full">
              <Paginator
                page={page || 0}
                totalPages={totalPages || 1}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          </>
        )}

        <NotificationProvider />
      </section>
    </CommentWidgetContext.Provider>
  );
}

function Comments({
  title = '[[nr]] reacties',
  sentiment = 'no sentiment',
  emptyListText = 'Nog geen reacties geplaatst.',
  placeholder = 'Typ hier uw reactie',
  formIntro = '',
  selectedComment,
  loginText = 'Inloggen om deel te nemen aan de discussie.',
  setRefreshComments = () => {},
  onGoToLastPage,
  ...props
}: CommentsWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(false);

  const triggerRefresh = () => {
    setRefreshKey((prevKey) => !prevKey);
  };

  useEffect(() => {
    if (typeof setRefreshComments === 'function') {
      setRefreshComments(triggerRefresh);
    }
  }, [setRefreshComments]);

  return (
    <div>
      <CommentsInner
        key={refreshKey ? 'refresh' : 'no-refresh'}
        title={title}
        sentiment={sentiment}
        emptyListText={emptyListText}
        placeholder={placeholder}
        formIntro={formIntro}
        selectedComment={selectedComment}
        loginText={loginText}
        setRefreshComments={triggerRefresh}
        onGoToLastPage={onGoToLastPage}
        {...props}
      />
    </div>
  );
}

Comments.loadWidget = loadWidget;

export { Comments };
