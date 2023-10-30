import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';
import Loading from '../loading';
import LoginButton from './login-button';
import LogoutButton from './logout-button';

const User = function( props ) {

  // dit zou denk ik een profile knop of zo moeten worden
  // voor nu is het: toon een login button als er geen user is,
  // en anders een logout button plus een json dump van de user

  props = merge.recursive({}, {
    loginLabel: 'Login',
    logoutLabel: 'Logout',
  }, props.config,  props);

  const datastore = new DataStore(props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useCurrentUser({ ...props });

  let titleHTML = null;
  if (currentUser && currentUser.id) {
    titleHTML = <h4>User</h4>
  }  

  let userHTML = currentUserIsLoading ? <Loading/> : null;
  if (currentUser && currentUser.id) {
    userHTML = (
      <pre>
        {JSON.stringify(currentUser, null, 2)}
      </pre>
    );
  }

  let buttonHTML = null;
  if (currentUser && currentUser.id) {
    buttonHTML = <LogoutButton {...props}/>
  } else {
    buttonHTML = <LoginButton {...props}/>
  }

  return (
    <div id={props.config.divId} className={props.className}>
      {buttonHTML}
      {titleHTML}
      {userHTML}
    </div>
  );

}

export {
  User as default,
  User,
};
