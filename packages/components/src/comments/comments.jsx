import { useState, useEffect, useCallback } from 'react';
import DataStore from '../data-store';

import Comment from './comment';
import CommentForm from './comment-form';


const Comments = function( props ) {

  const datastore = new DataStore(props);

  const [ user, setUser, userError, userIsLoading ] = datastore.useUser({ ...props });
  const [ comments, setComments, commentsError, commentsIsLoading ] = datastore.useComments({ ...props, ideaId: 3, sentiment: 'yes' });

  console.log('===', comments);

  // todo: dit moet passen op NLDS
  let className = 'osc-comments-component' + ( props.className ? ` ${props.className}` : '' );

  // console.log('RENDER comments', comments);

  self.sendForm = function(e) {

    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    console.log(form);
    
    const formData = new FormData(form);
    formData.append('ideaId', 3);
    setComments(formData)

//    // You can pass formData as a fetch body directly:
//    fetch('/some-api', { method: form.method, body: formData });
// 
//    // Or you can work with it as a plain object:
//    const formJson = Object.fromEntries(formData.entries());
//    console.log(formJson);
  }

  self.deleteComment = function(id) {
    let index = comments.findIndex( elem => elem.id == id );
    let newData = index ? comments.slice(0, index).concat( comments.slice(index+1) ) : comments;
    setComments(newData);
  }

  let errorHTML = null;
  if (commentsError) {
    console.log('****************************************');
    console.log(commentsError);
    errorHTML = <div>Error: {commentsError.message}</div>
  }

  return (
    <div id={props.config.divId} className={className} role="link" tabIndex="0">
      <h1>{comments.length} Comments {user.name}</h1>
      <CommentForm {...props} sendForm={e => self.sendForm(e)}/>

      { comments.map( ( comment, index ) => {
        let attributes = { ...props, ...comment, sendForm: self.sendForm, deleteComment: self.deleteComment, user };
        return <Comment { ...attributes } key={`osc-comment-${ index }`}/>
      }) }
    </div>
  );

}

export default Comments;
