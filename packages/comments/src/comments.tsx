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
    overridePage?: number;
    displayPagination?: boolean;
    displaySearchBar?: boolean;
    onGoToLastPage?: (goToLastPage: () => void) => void;
    extraFieldsTagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    defaultTags?: string;
    includeOrExclude?: string;
    onlyIncludeOrExcludeTagIds?: string;
    overrideSort?: string;
    searchTerm?: string;
    autoApply?: boolean;
    displayCollapsibleFilter?: boolean;
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
  displaySearchBar = false,
  overridePage = 0,
  setRefreshComments: parentSetRefreshComments = () => {}, // parent setter as fallback
  defaultTags,
  includeOrExclude = 'include',
  onlyIncludeOrExcludeTagIds = '',
  overrideSort = '',
  searchTerm = '',
  autoApply = false,
  displayCollapsibleFilter = false,

  ...props
}: CommentsWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0); // Key for SWR refresh
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState<number>(displayPagination ? itemsPerPage || 9999 : 9999 );
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (searchTerm !== search) setSearch(searchTerm)
  }, [searchTerm]);

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const tagIds = !!onlyIncludeOrExcludeTagIds && onlyIncludeOrExcludeTagIds.startsWith(',') ? onlyIncludeOrExcludeTagIds.substring(1) : onlyIncludeOrExcludeTagIds;

  const { data: allTags } = datastore.useTags({
    projectId: props.projectId,
    type: ''
  });

  const stringToArray = (str: string) => {
    return str.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
  }

  const tagIdsArray = stringToArray(tagIds);

  function determineTags(includeOrExclude: string, allTags: any, tagIdsArray: Array<number>) {
    let filteredTagIdsArray: Array<number> = [];
    try {
      if (includeOrExclude === 'exclude' && tagIdsArray.length > 0) {
        const filteredTags = allTags.filter((tag: { id: number }) => !tagIdsArray.includes((tag.id)));
        const filteredTagIds = filteredTags.map((tag: { id: number }) => tag.id);
        filteredTagIdsArray = filteredTagIds;
      } else if (includeOrExclude === 'include') {
        filteredTagIdsArray = tagIdsArray;
      }

      const filteredTagsIdsString = filteredTagIdsArray.join(',');

      return {
        tagsString: filteredTagsIdsString || ''
      };

    } catch (error) {
      return {
        tagsString: ''
      };
    }
  }

  const {
    tagsString: filteredTagsIdsString
  } = determineTags(includeOrExclude, allTags, tagIdsArray);

  const goToLastPage = () => {
    if (totalPages > 0 && displayPagination) {
      setPage(totalPages - 1);
    }
  };

  useEffect(() => {
    if (onGoToLastPage) {
      onGoToLastPage(goToLastPage);
    }
  }, [onGoToLastPage]);

  useEffect(() => {
    if (overridePage !== page) {
      setPage(overridePage);
    }
  }, [overridePage]);

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
    minCharactersWarning: props?.comments?.minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
    maxCharactersWarning: props?.comments?.maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over',
    minCharactersError: props?.comments?.minCharactersError || 'Tekst moet minimaal {minCharacters} karakters bevatten',
    maxCharactersError: props?.comments?.maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten',
    adminLabel: props.comments?.adminLabel || 'admin',
    ...props,
  } as CommentsWidgetProps;

  const useCommentsData = {
    projectId: props.projectId,
    resourceId: resourceId,
    sentiment: args.sentiment,
    onlyIncludeTagIds: props.onlyIncludeTags || filteredTagsIdsString || undefined,
    search: search || '',
    refreshKey
  };

  const { data: comments, isLoading } = datastore.useComments(useCommentsData);

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

    const defaultTagsArray = defaultTags
      ? defaultTags.split(',').map(tag => parseInt(tag.trim(), 10)).filter(tag => !isNaN(tag))
      : [];

    const formTags: string[] = [];
    Object.keys(formDataCopy)
      .filter(key => key.startsWith('tags-'))
      .forEach(key => {
        const tagsValue = formDataCopy[key];
        if (Array.isArray(tagsValue)) {
          formTags.push(...tagsValue);
        } else if (typeof tagsValue === 'string') {
          formTags.push(...tagsValue.split(',').map(tag => tag));
        }
      });

    const allTags = Array.from(new Set([...defaultTagsArray, ...formTags]) );
    formDataCopy.tags = allTags;

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

  const randomId = Math.random().toString(36).replace('0.', 'container_');

  const scrollToTop = () => {
    const divElement = document.getElementById(randomId);

    if (divElement) {
      divElement.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

    return (
    <CommentWidgetContext.Provider value={{ ...args, setRefreshComments: refreshComments || defaultSetRefreshComments }}>
      <section className="osc" id={randomId}>
        <Heading3 className="comments-title">
          {comments && title?.replace(/\[\[nr\]\]/, commentCount.toString()) }
          {!comments && title}
        </Heading3>

        {!args.canComment ? (
          <Banner>
            <Spacer size={2} />
            <p>{args.closedText}</p>
            <Spacer size={2} />
          </Banner>
        ) : null}

        {!args.canComment && hasRole(currentUser, 'moderator') ? (
          <Banner>
            <p>U kunt nog reageren vanwege uw rol als moderator</p>
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
              <Banner className="big" role="complementary">
                <p id="login-description">{ loginText }</p>
                <Spacer size={1} />
                <Button
                  appearance="primary-action-button"
                  aria-describedby="login-description"
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

        {
          ( ((props.sorting || []).length > 0 && datastore) || displaySearchBar) ? (
          <>
            <Filters
              className="osc-flex-columned"
              dataStore={datastore}
              sorting={props.sorting || []}
              displaySorting={ (props.sorting || []).length > 0 && datastore }
              defaultSorting={props.defaultSorting || 'createdAt_asc'}
              onUpdateFilter={(f) => {
                if (['createdAt_desc', 'createdAt_asc', 'title_asc', 'title_desc', 'votes_desc', 'votes_asc'].includes(f.sort)) {
                  setSort(f.sort);
                }
                setSearch(f?.search?.text || '');
              }}
              applyText={'Toepassen'}
              resources={undefined}
              displaySearch={displaySearchBar || false}
              displayTagFilters={false}
              searchPlaceholder={''}
              resetText={'Reset'}
              displayCollapsibleFilter={displayCollapsibleFilter}
              autoApply={autoApply}
            />

            <Spacer size={1}/>
          </>
        ) : null}

         {(Array.isArray(comments) && comments.length === 0) && (
            isLoading ? (
              <Paragraph className="osc-loading-results-text">Laden...</Paragraph>
            ) : (
              <Paragraph className="osc-no-results-text">
                {search ? `Er zijn geen resultaten gevonden voor "${search}".` : emptyListText}
              </Paragraph>
            )
          )}

        {(comments || [])
          ?.sort((a: any, b: any) => {
            const sortMethod = overrideSort || sort;

            if (sortMethod === 'createdAt_desc') {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (sortMethod === 'createdAt_asc') {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            if (sortMethod === 'title_asc' && a.description && b.description) {
              return a.description.localeCompare(b.description);
            }
            if (sortMethod === 'title_desc' && a.description && b.description) {
              return b.description.localeCompare(a.description);
            }
            if (sortMethod === 'votes_desc') {
              return b.yes - a.yes;
            }
            if (sortMethod === 'votes_asc') {
              return a.yes - b.yes;
            }

            return 0;
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
                onPageChange={(newPage) => {
                  setPage(newPage);
                  scrollToTop();
                }}
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
  overridePage,
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
        overridePage={overridePage}
        {...props}
      />
    </div>
  );
}

Comments.loadWidget = loadWidget;

export { Comments };
