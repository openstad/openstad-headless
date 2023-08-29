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

  let userName = props.user.displayName; // todo: gebruik de meegstuurde param
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
    return props.can.reply;
  }

  function canLike() {
    if (props.isClosed) return false;
    if (hasRole(props.currentUser, 'moderator')) return true;
    return hasRole(props.currentUser, props.requiredUserRole);
  }
  
  function canEdit() {
    if (props.isClosed) return false;
    if (hasRole(props.currentUser, 'moderator')) return true;
    return props.can.edit;
  }

  function canDelete() {
    if (props.isClosed) return false;

    console.log('++', hasRole(props.currentUser, 'moderator'));

    if (hasRole(props.currentUser, 'moderator')) return true;
    return props.can.delete;
  }

  let menuHTML = null;
  if ( canEdit() && canDelete() ) {
    menuHTML = (
      <div className={ `osc-comment-menu${   isMenuActive ? ' osc-comment-hamburger-active' : ''}` } onClick={ () => { setIsMenuActive(true); }}>
        <a className="osc-comment-delete" title="Argument verwijderen" onClick={ () => { if (confirm('Weet u het zeker?')) props.deleteComment(props.id); } }/>
        <a className="osc-comment-edit" title="Argument bewerken" onClick={ () => toggleEditForm() }/>
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
  if (props.isReplyingEnabled) {
    if (canReply()) {
      replyButtonHTML = (<a onClick={ () => toggleReplyForm() } className="osc-reply-button">Reageren</a>);
      if (isReplyFromActive) {
        replyFormHTML = (
			    <div id={`osc-comment-${props.id}`} className="osc-reply">
            REPLYFORM;
          </div>
        );
      }
    }
  }

  let repliesHTML = null;
  if (props.comments && props.comments.length) {
    repliesHTML = (
      <ul className="osc-comments-list">
        {props.reactions.map((reaction, index) => {
          let attributes = { ...props, ...reaction, submitComment: props.submitComment, deleteComment: props.deleteComment };
          let key = `osc-reaction-key-${   reaction.id || parseInt( 1000000 * Math.random() )}`;
          return (
            <li key={key}>
              <Comment { ...attributes } key={`osc-comment-${ index }`}/>
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



// de oude
/*
  showMenu() {
    this.setState({ isMenuActive: true });
  }

  toggleReplyForm() {
    this.setState({ isReplyFromActive: !this.state.isReplyFromActive });
  }

  toggleEditForm(what) {
    this.setState({ editMode: !this.state.editMode });
  }

  getUserName(user) {
    let self = this;
    let userNameFields = self.config.userNameFields;
    if (Array.isArray(userNameFields)) userNameFields = { or: [userNameFields] };
    return userNameFields.or.map(config => 
      Array.isArray(config) ? config.map(field => user[field]).join(' ') : user[config]
    ).find(name => !!name);
  }

  canEdit() {
    if (props.isClosed) return false;
    return props.props.can.edit;
  }

  canDelete() {
    if (props.isClosed) return false;
    return props.props.can.delete;
  }

  canLike() {
    if (props.isClosed) return false;
    let requiredUserRole = this.config.requiredUserRole;
    let userRole = props.user && props.user.role;
      return ( requiredUserRole == 'anonymous' && userRole )  ||
        ( requiredUserRole == 'member' && ( userRole == 'member' || userRole == 'editor' || userRole == 'moderator' || userRole == 'admin' ) )  ||
        ( requiredUserRole == 'editor' && ( userRole == 'editor' || userRole == 'moderator' || userRole == 'admin' ) )  ||
        ( requiredUserRole == 'moderator' && ( userRole == 'moderator' || userRole == 'admin' ) )  ||
        ( requiredUserRole == 'admin' && userRole == 'admin' );
  }

  canReply() {
    return props.props.can.reply;
  }

  hasRole(props.currentUser, 'moderator') {
    return OpenStadComponentLibs.user.hasRole(this.config.user, 'moderator');
  }

  submitDelete() {

    let self = this;

    if (!self.canDelete()) return alert('U kunt deze reactie niet verwijderen');

    let url = `${self.config.api && self.config.api.url   }/api/site/${  self.config.siteId  }/idea/${  self.config.ideaId  }/argument/${  self.props.props.id}`;
    let headers = OpenStadComponentLibs.api.getHeaders(self.config);

    let body = {};

    fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(body),
    })
      .then( function(response) {
        if (response.ok) {
          return response.json();
        }
        throw response.text();
      })
      .then(function(json) {
        self.setState({ isDeleted: true });

		    let event = new CustomEvent('osc-reaction-deleted', { detail: { ideaId: self.config.ideaId } });
		    document.dispatchEvent(event);

      })
      .catch(function(error) {
        console.log(error);
        error.then(function(messages) { return console.log(messages);} );
      });

  }

  submitLike() {

    let self = this;

    if (!self.canLike()) return self.config.showNotLoggedInPopup();

    let url = `${self.config.api && self.config.api.url   }/api/site/${  self.config.siteId  }/idea/${  self.config.ideaId  }/argument/${  self.props.props.id  }/vote`;
    let headers = OpenStadComponentLibs.api.getHeaders(self.config);

    let body = {};

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
      .then( function(response) {
        if (response.ok) {
          return response.json();
        }
        throw response.text();
      })
      .then(function(json) {
        // console.log({ yes: json.yes, hasUserVoted: json.hasUserVoted });
        self.setState({ yes: json.yes, hasUserVoted: json.hasUserVoted });
      })
      .catch(function(error) {
        console.log(error);
        error.then(function(messages) { return console.log(messages);} );
      });

  }

  onNewReactionStored(reaction) {
    this.setState({ isMenuActive: false, isReplyFromActive: false });
  }

  onReactionEdited(reaction) {
    if (reaction.id == props.props.id) {
      this.setState({ editMode: false, isMenuActive: false });
    }
  }

  render() {

    let self = this;
    let data = self.props.data || { can: {} };

    if (props.isDeleted) return null;

    let userName = self.getUserName(props.user);
    let isAdmin = OpenStadComponentLibs.user.hasRole(props.user, 'editor') ? 'osc-is-admin' : '';
    let metadataHTML = <div className={`osc-reaction-user ${isAdmin}`}>{userName}</div>

    let menuHTML = null;
    if ( self.canEdit() && self.canDelete() ) {
      menuHTML = (
        <div className={ `osc-reaction-menu${   self.state.isMenuActive ? ' osc-reaction-hamburger-active' : ''}` } onClick={ () => { self.showMenu(); }}>
          <a className="osc-reaction-delete" title="Argument verwijderen" onClick={ () => { if (confirm('Weet u het zeker?')) self.submitDelete(); } }/>
          <a className="osc-reaction-edit" title="Argument bewerken" onClick={ () => self.toggleEditForm() }/>
        </div>
      );
    }

    let descriptionHTML = (<div className="osc-reaction-description" dangerouslySetInnerHTML={{__html: props.description }}></div>);
    if (self.state.editMode) {
      descriptionHTML = (
        <div className="osc-reaction-description">
          <OpenStadComponentReactionForm config={{ ...self.config, description: props.description, argumentId: props.id }} user={self.state.user} ref={el => (self.editForm = el)}/>
        </div>
      );
    }

    let likeButtonHTML = null;
    if (!props.parentId) {
      if (self.config.isVotingEnabled) {
        if ((!props.isClosed || self.hasRole(props.currentUser, 'moderator') )) {
          likeButtonHTML = (
			      <a className={ `osc-reaction-like-button${ ( typeof props.hasUserVoted != 'undefined' ? props.hasUserVoted : props.hasUserVoted ) ? ' osc-reaction-like-button-hasvoted' : ''}` } onClick={ () => self.submitLike() }>
				      Mee eens (<span>{( typeof self.state.yes != 'undefined' ? self.state.yes : props.yes ) | 0}</span>)
            </a>
          );
        } else {
          likeButtonHTML = (
			      <div className={ `osc-reaction-like-button${ ( typeof props.hasUserVoted != 'undefined' ? props.hasUserVoted : props.hasUserVoted ) ? ' osc-reaction-like-button-hasvoted' : ''}` }>
				      Mee eens (<span>{( typeof self.state.yes != 'undefined' ? self.state.yes : props.yes ) | 0}</span>)
            </div>
          );
        }
      }
    }

    let replyButtonHTML = null;
    let replyFormHTML = null;
    if (self.config.isReplyingEnabled) {
      if (canReply() && (!props.isClosed || self.hasRole(props.currentUser, 'moderator') )) {
        replyButtonHTML = (<a onClick={ () => self.toggleReplyForm() } className="osc-reply-button">Reageren</a>);
        if (self.state.isReplyFromActive) {
          let config = { ...self.config, parentId: props.id };
          config.formIntro = '';
          replyFormHTML = (
			      <div id={`osc-reaction-${props.id}`} className="osc-reply">
              <OpenStadComponentReactionForm config={config} user={self.state.user} ref={el => (self.editForm = el)}/>
            </div>
          );
        }
      }
    }

    let repliesHTML = null;
    if (props.reactions && props.reactions.length) {
      repliesHTML = (
        <ul className="osc-reactions-list">
          {props.reactions.map((reaction) => {

            let key = `osc-reaction-key-${   reaction.id || parseInt( 1000000 * Math.random() )}`;
            return (
              <li key={key}>
                <OpenStadComponentReaction config={self.config} className="osc-reply" user={self.state.user} data={reaction}/>
              </li>
            );

          })}
        </ul>
      );
    }

    return (
      <div>

			  <div id={`osc-reaction-${props.id}`} className={ self.props.className || 'osc-reaction' }>

          {menuHTML}

          {metadataHTML}
				  <div className="osc-reaction-date">{props.createDateHumanized}</div>
          {descriptionHTML}

          {likeButtonHTML}
			    {replyButtonHTML}

		    </div>

			  {replyFormHTML}
        {repliesHTML}

		  </div>

    );

  }
*/
