import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import SessionStorage from '../lib/session-storage.js';
import hasRole from '../lib/has-role';
import DataStore from '../data-store';
import Button from '../button';
import Error from '../error';

import { cva } from "class-variance-authority";
const commentVariants = cva(
  "",
  {
    variants: {
      variant: {
      },
      size: {
      },
    },
    defaultVariants: {
    },
  }
);

const VoteSelection = function(props) {

  props = merge.recursive({}, {
    selection: [],
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

  const datastore = new DataStore(props);
  const session = new SessionStorage(props);

  let selectionHTML = (
    <>
      {props.selection.map((idea, index) => {
        return (
          <p key={`osc-selected-idea-${index}`}>
            {idea.title}
          </p>);
      })}
    </>
  )

  return (
    <div id={props.config.divId} style={{ backgroundColor: '#eee' }} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      <h3>Geselecteerde plannen</h3>
      {selectionHTML}
    </div>
  );

}

export default VoteSelection;
