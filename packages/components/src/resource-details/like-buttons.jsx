import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import SessionStorage from '../lib/session-storage.js';
import DataStore from '../data-store';
import Button from '../button';
import Error from '../error';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from "class-variance-authority";
const commentVariants = cva(
  "osc-likebuttons-component osc-likebuttons inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
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

const LikeButtons = function(props) {

  props = merge.recursive({}, {
    resource: {},
    votes: {
      isActive: false,
      requiredUserRole: 'member',
      voteType: 'likes',
      voteValues: [
        {
          label: 'Like',
          value: 'yes'
        }
      ]
    },
  }, props.config,  props);

  console.log(props);
  
  const datastore = new DataStore(props);
  const session = new SessionStorage(props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useCurrentUser({ ...props });
  const [ isBusy, setIsBusy ] = useState(false)

  useEffect(() => {
    let pending = session.get('osc-resource-vote-pending');
    console.log('PENDING', pending, props.resource.id, pending && pending[props.resource.id])
    if (pending && pending[props.resource.id]) {
      if (currentUser && currentUser.role) {
        doVote(null, pending[props.resource.id])
        session.remove('osc-resource-vote-pending');
      }
    }
  }, [props.resource, currentUser]);

  async function doVote(e, value) {

    console.log('VOTE', value);

    if (e) e.stopPropagation();

    if (isBusy) return;
    setIsBusy(true);

    // if (!props.votes.isActive) return;

    console.log('currentUser', currentUser);
    if (!currentUser.role) {
      // login
      session.set('osc-resource-vote-pending', { [props.resource.id]: value });
      return document.location.href = props.loginUrl;
    }

    let change = {};
    if (props.resource.userVote) change[props.resource.userVote.opinion] = -1;

    await props.resource.submitLike({
      opinion: value
    })

    setIsBusy(false);

  }

  let className = 'osc-numberplate-button';
  if (!props.votes.isActive) className += ' osc-inactive';

  let buttonsHTML = [];
  for (let value of props.votes.voteValues) {
    let isBusy = false;
    let VoteButton = (
      <Button type="button" disabled={isBusy} onClick={e => doVote(e, value.value)} key={`osc-vote-button-${value.value}`}>{value.label} ({props.resource && props.resource[value.value]})</Button>
    );
    buttonsHTML.push(VoteButton);
  }

  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      {buttonsHTML}
    </div>
  );

}

export default LikeButtons;
