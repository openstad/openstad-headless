import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';

import { cva } from "class-variance-authority";
const formVariants = cva(
  "osc-form-component osc-form",
  {}
);

const Forms = function(props) {

  props = merge.recursive({}, {
  }, props.config,  props);

  const [ currentUser, currentUserError, currentUserIsLoading ] = datastore.useCurrentUser({ ...props });

  return (
    <div id={props.config.divId} className={formVariants({ variant: props.variant, size: props.size, className: props.className })}>
      FORM
    </div>
  );

}

export default Forms;
