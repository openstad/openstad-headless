import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';
import LikeButtons from '../voting/like-buttons';
import Error from '../error';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-ideaDetails-component osc-ideaDetails inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
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

const IdeaDetails = function(props) {

  props = merge.recursive({}, {
    title: 'Idea details',
  }, props.config,  props);

  const datastore = new DataStore(props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useCurrentUser({ ...props });
  const [ idea, ideaError, ideaIsLoading ] = datastore.useIdea({ ...props });

  let ideaHTML = null;
  if (idea) {
    ideaHTML = (
      <>
        <h3>{idea.title}</h3>
        <p>
          <strong>Images:</strong> {JSON.stringify(idea.images, null, 2)}
        </p>
        <p>
          <strong>Summary:</strong> {idea.summary}
        </p>
        <p>
          <strong>Description:</strong> {idea.description}
        </p>
      </>
    );
  } else{
    if (ideaIsLoading) { // TODO: i18n
      ideaHTML = <div className="osc-empty-list-text">Loading...</div>
    } else {
      ideaHTML = <div className="osc-empty-list-text">{props.emptyListText}</div>
    }
  }
  
  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      <Error/>
      {ideaHTML}
      <LikeButtons {...props} idea={idea}/>
    </div>
  );

}

export default IdeaDetails;
