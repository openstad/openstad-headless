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
  },
  showDateSeperately = false,
  selected,
  type,
  index,
  adminLabel,
  disableSubmit = false,
  setRefreshComments,
  ...props
}: CommentProps) {
  const widgetContext = useContext(CommentWidgetContext);

  const args = {
    comment,
    selected,
    adminLabel,
    ...props,
  } as CommentProps;

  const datastore = new DataStore(args);
  const { data: currentUser } = datastore.useCurrentUser({ ...args });
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
      markerIcons[index]?.classList.toggle('--highlightedIcon');
      document.getElementById(`comment-${index}`)?.classList.toggle('selected');
    }
  }

  async function handleLike() {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = 100;

    // @ts-ignore
    await args.comment.submitLike().then((newData) => {
      const newVotes = newData.yes;
      const oldVotes = args.comment.yes;

      // Refreshing the likes so it gets updated eventually
      const tryToRefreshComments = () => {
        if (!widgetContext || !widgetContext.setRefreshComments) {
          clearInterval(intervalId);
        } else if (oldVotes !== newVotes && attempts < maxAttempts) {
          attempts++;
          if (widgetContext && widgetContext.setRefreshComments) {
            widgetContext.setRefreshComments((prev: boolean) => !prev);
          }
        } else if (attempts < maxAttempts) {
          attempts++;
        } else {
          clearInterval(intervalId);
        }
      }

      const intervalId = setInterval(tryToRefreshComments, interval);
    });
  }

  return (
    <article className={`comment-item ${selected ? 'selected' : ''}`} id={`comment-${index}`} onClick={findLocation(index || 0)}>
      <section className="comment-item-header">
        <Heading level={4} appearance='utrecht-heading-6' className={`reaction-name`}>
          {args.comment.user && args.comment.user.displayName}{' '}
          {args.comment.user && args.comment.user.role === 'admin' ? <span className='--isAdmin'>{adminLabel}</span> : null}
        </Heading>
        {canEdit() || canDelete() ? (
          <DropDownMenu
            items={[
              { label: 'Bewerken', onClick: () => toggleEditForm() },
              {
                label: 'Verwijderen',
                onClick: () => {
                  if (args.comment && confirm('Weet u het zeker?'))
                    args.comment.delete(args.comment.id);
                },
              },
            ]}/>
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
          <ButtonGroup>
            {widgetContext.canLike && (
              canLike() ? (
                <Button
                  appearance='secondary-action-button'
                  className={args.comment.hasUserVoted ? `active` : ''}
                  onClick={handleLike}>
                  <i className={args.comment.hasUserVoted ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}></i>
                  Mee eens (<span>{args.comment.yes || 0}</span>)
                </Button>
              ) : (
                <Button disabled>
                  <i className="ri-thumb-up-line"></i>
                  Mee eens (<span>{args.comment.yes || 0}</span>)
                </Button>
              )
            )}
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
            <ButtonGroup>
              {widgetContext.canLike && (
                canLike() ? (
                  <Button
                    appearance='secondary-action-button'
                    className={args.comment.hasUserVoted ? `active` : ''}
                    onClick={handleLike}>
                    <i className={args.comment.hasUserVoted ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}></i>
                    Mee eens (<span>{args.comment.yes || 0}</span>)
                  </Button>
                ) : (
                  <Button disabled>
                    <i className="ri-thumb-up-line"></i>
                    Mee eens (<span>{args.comment.yes || 0}</span>)
                  </Button>
                )
              )}
            </ButtonGroup>
          </section>
        </>
      )}

      <Spacer size={1} />

      {args.comment.replies &&
        args.comment.replies.map((reply, index) => {
          return (
            <div className="reaction-container" key={index}>
              <Comment {...args} comment={reply} disableSubmit={disableSubmit} showDateSeperately={false} />
            </div>
          );
        })}

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
            <Spacer size={1} />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export { Comment as default, Comment };
