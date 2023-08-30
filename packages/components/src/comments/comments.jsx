import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';
import hasRole from '../lib/user-has-role';
import Comment from './comment';
import CommentForm from './comment-form';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-comments-component osc-comments inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        icon: "w-10 hover:bg-foreground/10",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-12 py-4 px-4",
        sm: "h-10 px-2",
        lg: "h-14 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Comments = function(props) {

  props = merge.recursive({}, {
    sentiment: 'no sentiment',
    emptyListText: 'Nog geen reacties',
    title: '[[nr]] comments',
    requiredUserRole: 'member', // TODO
  }, props.config,  props);

  const datastore = new DataStore(props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useUser({ ...props });
  const [ comments, commentsError, commentsIsLoading ] = datastore.useComments({ ...props });

  let [ submitError, setSubmitError ] = useState();
  
  async function submitComment(e) {

    e.preventDefault();

    let formData = new FormData(e.target);
    formData = Object.fromEntries(formData.entries());

    formData.ideaId = props.ideaId;

    try {
      if ( formData.id ) {
        let comment = comments.find( c => c.id == formData.id );
        await comment.update(formData)
      } else {
        await comments.create(formData)
      }
    } catch(err) {
      console.log(err);
      setSubmitError(err)
    }

  }

  // TODO: dit komt uit de oude; willen we dit zo? 
  // showNotLoggedInPopup() {
  //   this.notLoggedInPopup.showPopup();
  // }

  let titleHTML = props.title ? <h3>{props.title.replace(/\[\[nr\]\]/, comments.length)}</h3> : null;

  let commentsFormHTML = <CommentForm {...props} submitComment={e => submitComment(e)}/>
  if (props.isClosed && !hasRole(props.currentUser, 'moderator')) {
    console.log('===', props);
    if (props.closedText) {
      commentsFormHTML = <div className="osc-closed-text">{props.closedText}</div>
    } else {
      commentsFormHTML = null
    }
  }

  // TODO: errors moeten nog
  let errorHTML = null;
  let error = submitError || commentsError;
  if (error) {
    console.log(error);
    errorHTML = <div className="osc-error-block">{error.message}</div>
  }

  let commentsHTML = null;
  if (comments.length) {
    commentsHTML = comments.map( ( comment, index ) => {
      let attributes = { ...props, ...comment, currentUser, submitComment };
      // todo: maar er een ul met li van
      return <Comment { ...attributes } key={`osc-comment-${ index }`}/>
    })
  } else{
    if (commentsIsLoading) { // TODO: i18n
      commentsHTML = <div className="osc-empty-list-text">Loading...</div>
    } else {
      commentsHTML = <div className="osc-empty-list-text">{props.emptyListText}</div>
    }
    
  }
  
  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      {titleHTML}
      {errorHTML}
      {commentsFormHTML}
      {commentsHTML}
    </div>
  );

}

export default Comments;
