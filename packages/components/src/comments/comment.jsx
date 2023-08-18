import { useState, useEffect, useCallback } from 'react';

// import '../css/default.less'; // add css to result - TODO: dit moet beter
import CommentForm from './comment-form';

const Comment = function( props ) {

  const user = props.user;

  const [editMode, setEditMode] = useState(false);

  // todo: dit moet passen op NLDS
  let className = 'osc-comment' + ( props.className ? ` ${props.className}` : '' );

  let formHTML = null;
  if (editMode) {
    formHTML = <CommentForm {...props} sendForm={e => props.sendForm(e)}/>
  }
  
  return (
    <div id={props.config.divId} className={className} role="link" tabIndex="0">
      {formHTML}
      <div>
        <span style={{ color: props && props.can && props.can.edit ? 'green' : 'black' }}>
          {props.id} - {props.description}
        </span>
      </div>
      <div>
        {props.can && props.can.edit &&
          <button onClick={e => setEditMode(!editMode)}>Edit</button>}
        {props.can && props.can.delete &&
         <button onClick={e => props.deleteComment( props.id )}>delete</button>}
      </div>
      <br/>
    </div>
  );

}

export default Comment;
