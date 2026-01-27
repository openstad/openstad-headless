import React, { useContext } from 'react';
import '../index.css';
import { useState } from 'react';
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import CommentForm from './comment-form.js';
import { DropDownMenu } from '@openstad-headless/ui/src';
import hasRole from '../../../lib/has-role';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Paragraph, Heading, Button, ButtonGroup } from "@utrecht/component-library-react";
import { CommentProps } from '../types/comment-props';
import { CommentWidgetContext } from '../comments';

function Comment({
  comment = {
    id: 0,
    delete(arg) {
      throw new Error('Not implemented');
    },
    submitLike() {
      throw new Error('Not implemented');
    },
    submitDislike() {
      throw new Error('Not implemented');
    },
  },
  showDateSeperately = false,
  selected,
  type,
  index,
  adminLabel,
  editorLabel,
  disableSubmit = false,
  extraReplyButton = false,
  setRefreshComments,
  variant = 'medium',
  ...props
}: CommentProps) {
  const widgetContext = useContext(CommentWidgetContext);

  const args = {
    comment,
    selected,
    adminLabel,
    editorLabel,
    ...props,
  } as CommentProps;

  const datastore = new DataStore(args);
  const { data: currentUser } = datastore.useCurrentUser({ ...args });
  const [isReplyFormActive, setIsReplyFormActive] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [yesVotes, setYesVotes] = useState<number>(args.comment.yes || 0);
  const [noVotes, setNoVotes] = useState<number>(args.comment.no || 0);
  const [netPositiveVotes, setNetPositiveVotes] = useState<number>(args.comment.netPositiveVotes || 0);
  const [hasUserLiked, setHasUserLiked] = useState<boolean>(args.comment.hasUserLiked || false);
  const [hasUserDisliked, setHasUserDisliked] = useState<boolean>(args.comment.hasUserDisliked || false);

  function toggleReplyForm() {
    // todo: scrollto
    setIsReplyFormActive(!isReplyFormActive);
  }

  function toggleEditForm() {
    setEditMode(!editMode);
  }

  function canReply() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (!widgetContext.canReply) return false; // widget setting
    return args.comment.can && args.comment.can.reply;
  }

  function canLike() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return hasRole(currentUser, widgetContext.requiredUserRole);
  }

  function canEdit() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.edit;
  }

  function canDelete() {
    if (!widgetContext || !widgetContext.canComment) return false;
    if (hasRole(currentUser, 'moderator')) return true;
    return args.comment.can && args.comment.can.delete;
  }

  if (!widgetContext) {
    return null;
  }

  const findLocation = (index: number) => () => {

    const markerIcons = Array.from(document.getElementsByClassName('leaflet-marker-icon'));
    const comments = Array.from(document.getElementsByClassName('comment-item'));
    const isAlreadySelected = markerIcons[index]?.classList.contains('--highlightedIcon');

    markerIcons.forEach((markerIcon) => markerIcon.classList.remove('--highlightedIcon'));
    comments.forEach((comment) => comment.classList.remove('selected'));

    if (!isAlreadySelected) {
      markerIcons.forEach((markerIcon) => {
        if (markerIcon.classList.contains(`id-${index}`)) {
          markerIcon.classList.add('--highlightedIcon');
        }
      })
      document.getElementById(`comment-${index}`)?.classList.toggle('selected');
    }
  }

  async function handleLike() {
    const newData = await args.comment.submitLike() as CommentProps['comment'];

    setHasUserLiked(newData.hasUserLiked || false);
    setHasUserDisliked(newData.hasUserDisliked || false);
    setYesVotes(newData.yes || 0);
    setNoVotes(newData.no || 0);
    setNetPositiveVotes(newData.netPositiveVotes || 0);
  }

  async function handleDislike() {
    const newData = await args.comment.submitDislike() as CommentProps['comment'];

    setHasUserLiked(newData.hasUserLiked || false);
    setHasUserDisliked(newData.hasUserDisliked || false);
    setYesVotes(newData.yes || 0);
    setNoVotes(newData.no || 0);
    setNetPositiveVotes(newData.netPositiveVotes || 0);
  }


  return (
    <article className={`comment-item ${selected ? 'selected' : ''}`} id={`comment-${comment?.id}`} onClick={findLocation(comment?.id || 0)}>
      <section className="comment-item-header">
        <Heading level={4} appearance='utrecht-heading-6' className={`reaction-name`}>
          {args.comment.user && args.comment.user.displayName}{' '}
          {args.comment.user && args.comment.user.role === 'admin' && adminLabel ? (
            <span className='--isAdmin'>{adminLabel}</span>
          ) : null}
          {args.comment.user && args.comment.user.role === 'editor' && editorLabel ? (
            <span className='--isEditor'>{editorLabel}</span>
          ) : null}
        </Heading>
        {canEdit() || canDelete() ? (
          <div className="edit-delete-button-group">
            <Button appearance="subtle-button" onClick={() => setIsOpen(!isOpen)}>
              <div>
                <i className={isOpen ? "ri-close-fill" : "ri-more-fill"}></i>
                <span className="sr-only">Bewerken</span>
              </div>
            </Button>

            {isOpen && (
              <div className="DropdownMenuContent">
                <ButtonGroup direction='column'>
                  <Button
                    appearance='secondary-action-button'
                    className="DropdownMenuItem"
                    onClick={() => {
                      setIsOpen(false);
                      toggleEditForm();
                    }}
                  >
                    Bewerken
                  </Button>
                  <Button
                    appearance='secondary-action-button'
                    className="DropdownMenuItem"
                    onClick={() => {
                      if (args.comment && confirm('Weet u het zeker?'))
                        args.comment.delete(args.comment.id);
                    }}
                  >
                    Verwijderen
                  </Button>
                </ButtonGroup>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {editMode ? (
        <CommentForm
          {...args}
          activeMode="edit"
          comment={args.comment}
          disableSubmit={disableSubmit}
          placeholder={widgetContext.placeholder}
          submitComment={(e) => {
            if (props.submitComment) {
              props.submitComment(e);
            }
            toggleEditForm();
          }}
        />
      ) : (
        <>
          <Spacer size={0.25} />
          <Paragraph className="comment-reaction-text">{args.comment.description}</Paragraph>
          <Spacer size={0.25} />
          {showDateSeperately && (
            <Paragraph className="comment-reaction-strong-text">
              {args.comment.createDateHumanized}
            </Paragraph>
          )}
        </>
      )}
      {!args.comment.parentId && (
        <section className="comment-item-footer">
          <Paragraph className="comment-reaction-strong-text">
            {args.comment.createDateHumanized}
          </Paragraph>
          <ButtonGroup className={`variant-${variant}`}>
            <div>
              {widgetContext.canLike && (
                canLike() ? (
                  <Button
                    appearance='secondary-action-button'
                    className={hasUserLiked ? `active` : ''}
                    onClick={handleLike}>
                    <i className={hasUserLiked ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}></i>
                    {variant != 'micro-score' && (<>Mee eens (<span>{yesVotes}</span>)</>)}
                    {variant == 'micro-score' && (<span className='sr-only'>Mee eens</span>)}
                  </Button>
                ) : (
                  <Button disabled>
                    <i className="ri-thumb-up-line"></i>
                    {variant != 'micro-score' && (<>Mee eens (<span>{yesVotes}</span>)</>)}
                    {variant == 'micro-score' && (<span className='sr-only'>Mee eens</span>)}
                  </Button>
                )
              )}
              {variant == 'micro-score' && (
                <Paragraph className="comment-reaction-score"><span className='sr-only'>Score</span> {netPositiveVotes}</Paragraph>
              )}
              {widgetContext.canDislike && (
                canLike() ? (
                  <Button
                    appearance='secondary-action-button'
                    className={hasUserDisliked ? `active` : ''}
                    onClick={handleDislike}>
                    <i className={hasUserDisliked ? 'ri-thumb-down-fill' : 'ri-thumb-down-line'}></i>
                    {variant != 'micro-score' && (<>Mee oneens (<span>{noVotes}</span>)</>)}
                    {variant == 'micro-score' && (<span className='sr-only'>Mee oneens</span>)}
                  </Button>
                ) : (
                  <Button disabled>
                    <i className="ri-thumb-down-line"></i>
                    {variant != 'micro-score' && (<>Mee oneens (<span>{noVotes}</span>)</>)}
                  </Button>
                )
              )}
            </div>
            {canReply() ? (
              <Button
                appearance='primary-action-button'
                onClick={() => toggleReplyForm()}>
                Reageren
              </Button>
            ) : null}
          </ButtonGroup>
        </section>
      )}

      {args.comment.parentId && (
        <>
          <section className="comment-item-footer">
            <Paragraph className="comment-reaction-strong-text">
              {args.comment.createDateHumanized}
            </Paragraph>
            <ButtonGroup className={`variant-${variant}`}>
              <div>
                {widgetContext.canLike && (
                  canLike() ? (
                    <Button
                      appearance='secondary-action-button'
                      className={hasUserLiked ? `active` : ''}
                      onClick={handleLike}>
                      <i className={hasUserLiked ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}></i>
                      {variant != 'micro-score' && (<>Mee eens (<span>{yesVotes}</span>)</>)}
                      {variant == 'micro-score' && (<span className='sr-only'>Mee eens</span>)}
                    </Button>
                  ) : (
                    <Button disabled>
                      <i className="ri-thumb-up-line"></i>
                      {variant != 'micro-score' && (<>Mee eens (<span>{yesVotes}</span>)</>)}
                      {variant == 'micro-score' && (<span className='sr-only'>Mee eens</span>)}
                    </Button>
                  )
                )}
                {variant == 'micro-score' && (
                  <Paragraph className="comment-reaction-score"><span className='sr-only'>Score</span> {netPositiveVotes}</Paragraph>
                )}
                {widgetContext.canDislike && (
                  canLike() ? (
                    <Button
                      appearance='secondary-action-button'
                      className={hasUserDisliked ? `active` : ''}
                      onClick={handleDislike}>
                      <i className={hasUserDisliked ? 'ri-thumb-down-fill' : 'ri-thumb-down-line'}></i>
                      {variant != 'micro-score' && (<>Mee oneens (<span>{noVotes}</span>)</>)}
                      {variant == 'micro-score' && (<span className='sr-only'>Mee oneens</span>)}
                    </Button>
                  ) : (
                    <Button disabled>
                      <i className="ri-thumb-down-line"></i>
                      {variant != 'micro-score' && (<>Mee oneens (<span>{noVotes}</span>)</>)}
                      {variant == 'micro-score' && (<span className='sr-only'>Mee oneens</span>)}
                    </Button>
                  )
                )}
              </div>
            </ButtonGroup>
          </section>
        </>
      )}

      <Spacer size={1} />

      {args.comment.replies &&
        args.comment.replies.map((reply, index) => {
          return (
            <div className="reaction-container" key={index}>
              <Comment {...args} variant={variant} comment={reply} disableSubmit={disableSubmit} showDateSeperately={false} />
            </div>
          );
        })}

      {extraReplyButton && (

        (!args.comment.parentId && args.comment.replies && args.comment.replies.length > 0 && canReply() && !isReplyFormActive) && (
          <Button
            appearance='secondary-action-button'
            className="reply-container-button"
            onClick={() => toggleReplyForm()}>
            Reageren
          </Button>
        )

      )}

      {isReplyFormActive ? (
        <div className="reaction-container">
          <div className="input-container">
            <CommentForm
              {...args}
              activeMode="reply"
              disableSubmit={disableSubmit}
              formIntro="Reageer op deze reactie"
              parentId={args.comment.id}
              placeholder={widgetContext.placeholder}
              // hideReplyAsAdmin={true}
              submitComment={(e) => {
                if (props.submitComment) {
                  props.submitComment(e);
                }
                toggleReplyForm();
              }}
            />
            <Spacer size={.5} />
            <Button className={'cancel-reply'} onClick={toggleReplyForm}> Annuleren </Button>
            <Spacer size={1} />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export { Comment as default, Comment };
