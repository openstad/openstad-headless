import merge from 'merge';
import { useState, useEffect, useCallback, ReactElement } from 'react';
import SessionStorage from '../lib/session-storage.js';
import hasRole from '../lib/has-role.js';
import DataStore from '../data-store/index';
import Button from '../button/index.jsx';
import Error from '../error/index.jsx';

// TODO: op verzoek van Daan; gaan we dat gebruiken?
// TODO: dit moet, sort of, passen op NLDS
import { cva } from 'class-variance-authority';
import React from 'react';
import { WidgetConfig } from '../types/config.js';

const types = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  icon: 'w-10 hover:bg-foreground/10',
  link: 'underline-offset-4 hover:underline text-primary',
};

const sizes = {
  default: 'h-12 py-4 px-4',
  sm: 'h-10 px-2',
  lg: 'h-14 px-8',
};

type ButtonVariants = keyof typeof types;
type ButtonSizes = keyof typeof sizes;

const commentVariants = cva(
  'osc-likebuttons-component osc-likebuttons inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: types,
      size: {
        default: 'h-12 py-4 px-4',
        sm: 'h-10 px-2',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// We need a type for props that has the full config specification for widgets
const LikeButtons = function (
  props: WidgetConfig & {
    variant: ButtonVariants;
    size: ButtonSizes;
    className: string;
  }
) {
  props = merge.recursive(
    {},
    {
      idea: {},
      votes: {
        isActive: false,
        requiredUserRole: 'member',
        voteType: 'likes',
        voteValues: [
          {
            label: 'Like',
            value: 'yes',
          },
        ],
      },
    },
    props.config,
    props
  );

  const datastore = new DataStore(props);
  const session = new SessionStorage(props);

  const [currentUser, currentUserError, currentUserIsLoading] =
    datastore.useCurrentUser({ ...props });
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let pending = session.get('osc-idea-vote-pending');
    if (pending && pending[props.idea.id]) {
      if (currentUser && currentUser.role) {
        doVote(null, pending[props.idea.id]);
        session.remove('osc-idea-vote-pending');
      }
    }
  }, [props.idea, currentUser]);

  async function doVote(e: any, value: any) {
    if (e) e.stopPropagation();

    if (isBusy) return;
    setIsBusy(true);

    if (!props.votes.isActive) {
      return;
    }

    if (
      !currentUser.role ||
      !hasRole(currentUser, props.votes.requiredUserRole)
    ) {
      // login
      session.set('osc-idea-vote-pending', { [props.idea.id]: value });
      return (document.location.href = props.login.url);
    }

    let change: any = {};
    if (props.idea.userVote) change[props.idea.userVote.opinion] = -1;

    await props.idea.submitLike({
      opinion: value,
    });

    setIsBusy(false);
  }

  let className = 'osc-numberplate-button';
  if (!props.votes.isActive) className += ' osc-inactive';

  let buttonsHTML: ReactElement[] = [];
  for (let value of props.votes.voteValues) {
    let isBusy = false;
    let VoteButton = (
      <Button
        type="button"
        disabled={isBusy}
        onClick={(e: any) => doVote(e, value.value)}
        key={`osc-vote-button-${value.value}`}>
        {value.label} ({props.idea && props.idea[value.value]})
      </Button>
    );
    buttonsHTML.push(VoteButton);
  }

  return (
    <div
      id={props.config?.divId}
      className={commentVariants({
        variant: props.variant,
        size: props.size,
        className: props.className,
      })}>
      {buttonsHTML}
    </div>
  );
};

export default LikeButtons;
