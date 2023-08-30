import merge from 'merge';

import { useState, useEffect, useCallback } from 'react';

import Button from '../button';
import CommentForm from './comment-form';

import hasRole from '../lib/user-has-role';


import './css/default.less'; // add css to result - TODO: dit moet beter

const Comment = function( props ) {

  props = merge.recursive({}, {
    isClosed: false,
    isVotingEnabled: true,
    isReplyingEnabled: true,
    requiredUserRole: 'member', // TODO
    userNameFields: ['displayName'],
  }, props.config,  props);

  const [isMenuActive, setIsMenuActive] = useState(false);
  const [isReplyFromActive, setIsReplyFromActive] = useState(false);
  const [editMode, setEditMode] = useState(false);

  let className = 'osc-comment' + ( props.className ? ` ${props.className}` : '' ); // todo: dit moet passen op NLDS

  let userName = props.user && props.user.displayName; // todo: gebruik de meegstuurde param
  let authorIsAdmin = hasRole(props.user, 'editor') ? 'osc-is-admin' : '';
  let metadataHTML = (<div className={`osc-comment-user ${authorIsAdmin}`}>{userName}</div>);

  function toggleReplyForm() {
    setIsReplyFromActive(!isReplyFromActive);
  }

  function toggleEditForm(what) {
    setEditMode(!editMode);
  }

  function canReply() {
    if (props.isClosed) return false;
    if (hasRole(props.currentUser, 'moderator')) return true;
    return props.can && props.can.reply;
  }

  function canLike() {
    if (props.isClosed) return false;
    if (hasRole(props.currentUser, 'moderator')) return true;
    return hasRole(props.currentUser, props.requiredUserRole);
  }
  
  function canEdit() {
    if (props.isClosed) return false;
    if (hasRole(props.currentUser, 'moderator')) return true;
    return props.can && props.can.edit;
  }

  function canDelete() {
    if (props.isClosed) return false;

    if (hasRole(props.currentUser, 'moderator')) return true;
    return props.can && props.can.delete;
  }

  let menuHTML = null;
  if ( canEdit() && canDelete() ) {
    menuHTML = (
      <div className={ `osc-comment-menu${   isMenuActive ? ' osc-comment-hamburger-active' : ''}` } onClick={ () => { setIsMenuActive(true); }}>
        <a className="osc-comment-delete" title="Comment verwijderen" onClick={ () => { if (confirm('Weet u het zeker?')) props.delete(props.id); } }/>
        <a className="osc-comment-edit" title="Comment bewerken" onClick={ () => toggleEditForm() }/>
      </div>
    );
  }

  let descriptionHTML = (<div className="osc-comment-description" dangerouslySetInnerHTML={{__html: props.description }}></div>);
  if (editMode) {
    descriptionHTML = (
      <div className="osc-comment-description">
        <CommentForm {...props} submitComment={e => { props.submitComment(e); setEditMode(!editMode) }}/>
      </div>
    );
  }

  let likeButtonHTML = null;
  if (!props.parentId) {
    if (props.isVotingEnabled) {
      if (canLike()) {
				likeButtonHTML = (
					<a className={ `osc-comment-like-button${ ( typeof props.hasUserVoted != 'undefined' ? props.hasUserVoted : props.hasUserVoted ) ? ' osc-comment-like-button-hasvoted' : ''}` } onClick={ () => props.submitLike() }>
						Mee eens (<span>{props.yes || 0}</span>)
					</a>
				);
			} else {
				likeButtonHTML = (
					<div className={ `osc-comment-like-button${ ( typeof props.hasUserVoted != 'undefined' ? props.hasUserVoted : props.hasUserVoted ) ? ' osc-comment-like-button-hasvoted' : ''}` }>
						Mee eens (<span>{props.yes || 0}</span>)
					</div>
				);
      }
    }
  }
  likeButtonHTML = likeButtonHTML || <div>&nbsp;</div>

  let replyButtonHTML = null;
  let replyFormHTML = null;
  if (!props.parentId) {
    if (props.isReplyingEnabled) {
      if (canReply()) {
        replyButtonHTML = (<a onClick={ () => toggleReplyForm() } className="osc-reply-button">Reageren</a>);
        if (isReplyFromActive) {
          let formfields = {...props};
          formfields.parentId = formfields.id;
          delete formfields.id;
          delete formfields.description;
          replyFormHTML = (
			      <div id={`osc-comment-${props.id}`} className="osc-reply">
              <CommentForm {...formfields} submitComment={e => { props.submitComment(e); setEditMode(!editMode) }}/>
            </div>
          );
        }
      }
    }
  }

  let repliesHTML = null;
  if (props.replies && props.replies.length) {
    repliesHTML = (
      <ul className="osc-comments-list">
        {props.replies.map((reply, index) => {
          let attributes = { ...props };
          delete attributes.replies;
          attributes = merge.recursive(attributes, reply);
          let key = `osc-reply-key-${   reply.id || parseInt( 1000000 * Math.random() )}`;
          return (
            <li key={key}>
              <Comment { ...attributes } className="osc-reply" key={`osc-comment-${ index }`}/>
            </li>
          );

        })}
      </ul>
    );
  }

  return (
    <div>

			<div id={`osc-comment-${props.id}`} className={ props.className || 'osc-comment' }>

        {menuHTML}

        {metadataHTML}
				<div className="osc-comment-date">{props.createDateHumanized}</div>
        {descriptionHTML}

        {likeButtonHTML}
			  {replyButtonHTML}

		  </div>

			{replyFormHTML}
      {repliesHTML}

		</div>

  );

}

export default Comment;
