import React from 'react';
import { Input, Spacer } from '@openstad-headless/ui/src';
import { useState } from 'react';
import { SecondaryButton } from '@openstad-headless/ui/src/button';
import CommentFormPropsType from '../types/comment-form-props.ts';
import DataStore from '@openstad-headless/data-store/src';
import hasRole from '../../../lib/has-role';

function CommentForm({
  descriptionMinLength = 30,
  descriptionMaxLength = 500,
  placeholder = 'Type hier je reactie',
  formIntro = '',
  requiredUserRole = 'member',
  ...props
}: CommentFormPropsType) {

  const datastore = new DataStore(props);
  const [currentUser, currentUserError, currentUserIsLoading] = datastore.useCurrentUser({ ...props });

  const [showButton, setShowButton] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');

  function canSubmit() {
    return hasRole(currentUser, props.requiredUserRole)
  }

  return (
    <div className="reaction-input-container">
      <p>{formIntro}</p>
      <Input
        onFocus={() => setShowButton(true)}
        onBlur={() => !value && setShowButton(false)}
        placeholder="Type hier uw reactie"
        onChange={(e) => setValue(e.target.value)}
        defaultValue={value}
      />
      <Spacer size={0.5} />
      {showButton ? (
        <SecondaryButton
          disabled={!value}
          onClick={() => {
            // Do stuffs here update swr caches
            setShowButton(false);
          }}>
          Submit
        </SecondaryButton>
      ) : null}
    </div>
  );
}

export {
  CommentForm as default,
  CommentForm,
}
