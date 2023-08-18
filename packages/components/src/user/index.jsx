// import 'whatwg-fetch'; // polyfill - todo: moet dit nog?
import './css/default.less'; // add css to result
import { useState, useEffect, useCallback } from 'react';

const User = function( props ) {

  const [ cmsUser, setCmsUser ] = useState( props.cmsUser || props.config.cmsUser );
  const [ openStadUser, setOpenstadUser ] = useState( props.openStadUser || props.config.openStadUser );

  console.log('-- user');

  let cmsUserHTML = null;
  if (cmsUser) {
    cmsUserHTML = (
      <>
        <h3>cmsUser</h3>
        <pre>
          {JSON.stringify(cmsUser, null, 2)}
        </pre>
      </>
    );
  }

  let openStadUserHTML = null;
  if (openStadUser) {
    openStadUserHTML = (
      <>
        <h3>openStadUser</h3>
        <pre>
          {JSON.stringify(openStadUser, null, 2)}
        </pre>
      </>
    );
  }
  
  return (
    <div id={props.config.divId} className={props.className}>
      <h1>User Component</h1>
      {cmsUserHTML}
      {openStadUserHTML}
    </div>
  );

}

export {
  User as default,
  User,
};
