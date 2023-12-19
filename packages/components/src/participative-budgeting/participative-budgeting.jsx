import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import hasRole from '../lib/has-role';
import DataStore from '../data-store';
import SessionStorage from '../lib/session-storage.js';
import Button from '../button';
import LoginButton from '../user/login-button';
import VoteSelection from '../voting/vote-selection';
import ResourcesOverview from '../resources-overview';
import ErrorComponent from '../error';

import { cva } from "class-variance-authority";
const commentVariants = cva(
  "",
  {
    variants: {
    },
  }
);

const ParticipativeBudgeting = function(props) {

  props = merge.recursive({}, {
    title: 'Participative Budgeting',
  }, props.config,  props);

  const datastore = new DataStore(props);
  const session = new SessionStorage(props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useCurrentUser({ ...props });
  const [ userVote, userVoteError, userVoteIsLoading ] = datastore.useUserVote({ ...props });
  const [ isBusy, setIsBusy ] = useState(false)
  const [ selection, setSelection ] = useState([]);
  const [ step, setStep ] = useState(0);
  const [ voteResult, setVoteResult ] = useState({});

  useEffect(() => {
    setSelection(session.get('osc-voting-selection') || []);
    setStep(session.get('osc-voting-step') || 0);
  }, []);

  function addToSelection(e, resource) {
    let result = [...selection];
    result.push(resource)
    setSelection(result);
    session.set('osc-voting-selection', result);
  }

  function removeFromSelection(e, resource) {
    let index = selection.findIndex(elem => elem.id == resource.id);
    if (index != -1) {
      let result = [...selection]
      result.splice(index, 1)
      setSelection(result);
      session.set('osc-voting-selection', result);
    }
  }

  function toggleSelection(e, resource) {
    let index = selection.findIndex(elem => elem.id == resource.id);
    if (index == -1) {
      addToSelection(e, resource);
    } else {
      removeFromSelection(e, resource);
    }
  }

  function gotoStep(targetStep) {
    setStep(targetStep);
    session.set('osc-voting-step', targetStep);
  }

  function nextStep() {
    if (step <= 4) gotoStep(step + 1);
  }

  function previousStep() {
    if (step > 0) gotoStep(step - 1);
  }

  async function doVote(e, value) {

    console.log('DOVOTE');

    if (e) e.stopPropagation();

    if (isBusy) return;
    setIsBusy(true);

    if (!props.votes.isActive) {
      return;
    }

    if (!currentUser || !currentUser.role || !hasRole(currentUser, props.votes.requiredUserRole) ) {
      // how did you get here
      let error = new Error('Deze gebruiker kan niet stemmen');
	    let event = new window.CustomEvent('osc-error', { detail: error });
	    document.dispatchEvent(event);
    }

    let result = await userVote.submitVote(selection);

    setVoteResult(voteResult);
    nextStep();

    setIsBusy(false);

  }

  function reset() {
    setStep(0);
    session.remove('osc-voting-step');
    setSelection([]);
    session.remove('osc-voting-selection');
  }

  let allHTML = null;

  switch (step) {
    case 0: // select resources
      allHTML = (
        <>
          <VoteSelection {...props} selection={selection}/>
          <Button type="button" disabled={isBusy} onClick={e => nextStep()}>Volgende</Button>
          <ResourcesOverview {...props} selection={selection} title="Selecteer je plannen" onResourceClick={toggleSelection}/>
        </>
      );
      break;

    case 1: // preview selection
      allHTML = (
        <>
          <VoteSelection {...props} selection={selection}/>
          <Button type="button" disabled={isBusy} onClick={e => previousStep()}>Vorige</Button>
          <Button type="button" disabled={isBusy} onClick={e => nextStep()}>Volgende</Button>
        </>
      );
      break;

    case 2: // login
      if (currentUser && currentUser.role && hasRole(currentUser, props.votes.requiredUserRole) ) nextStep();
      allHTML = (
        <>
          Nu moet je inloggen
          <Button type="button" disabled={isBusy} onClick={e => previousStep()}>Vorige</Button>
          <LoginButton {...props} label="Inloggen"/>
        </>
      );
      break;

    case 3: // do vote
      if (!currentUser || !currentUser.role || !hasRole(currentUser, props.votes.requiredUserRole) ) previousStep();
      allHTML = (
        <>
          Je bent ingelogd. Stem nu.
          <Button type="button" disabled={isBusy} onClick={e => gotoStep(1)}>Vorige</Button>
          <Button type="button" disabled={isBusy} onClick={e => doVote()}>Stem nu</Button>
        </>
      );
      break;

    case 4: // result
      allHTML = (
        <>
          Klaar
          <Button type="button" disabled={isBusy} onClick={e => reset()}>Reset</Button>
        </>
      );
      break;

  }
  
  let titleHTML = props.title ? <h3>{ props.title } - stap {step + 1}</h3> : null;
  
  return (
    <div id={props.config.divId} className={commentVariants({ variant: props.variant, size: props.size, className: props.className })}>
      <ErrorComponent/>
      {titleHTML}
      {allHTML}
    </div>
  );

}

export default ParticipativeBudgeting;
