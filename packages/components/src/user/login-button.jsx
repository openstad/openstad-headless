import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import Button from '../button';

const LoginButton = function( props ) {

  props = merge.recursive({}, {
    currentUser: {},
    label: 'Login',
  }, props.config, props.config?.login, props.login, props);

  function doLogin(e) {
    if (e) e.stopPropagation();
    return document.location.href = props.url;
  }

  let label = props.label;
  label.replace(/[[username]]/, props.currentUser.displayName || '');

  return (
    <Button type="button" onClick={e => doLogin(e)}>{label}</Button>
  );

}

export {
  LoginButton as default,
  LoginButton,
};
