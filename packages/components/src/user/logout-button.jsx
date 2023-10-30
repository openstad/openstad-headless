import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import Button from '../button';

const LogoutButton = function( props ) {

  props = merge.recursive({}, {
    currentUser: {},
    label: 'Logout',
  }, props.config, props.config?.logout, props.logout, props);

  function doLogout(e) {
    if (e) e.stopPropagation();

    // delete sessionData[projectId]
    // window.sessionStorage.setItem('openstad', JSON.stringify(sessionData))

    return document.location.href = props.url;
  }

  let label = props.label;
  label.replace(/[[username]]/, props.currentUser.displayName || '');

  return (
    <Button type="button" onClick={e => doLogout(e)}>{label}</Button>
  );

}

export {
  LogoutButton as default,
  LogoutButton,
};
