import { useState, useEffect, useCallback } from 'react';

function CommentForm(props) {

  return (
    <form  onSubmit={props.sendForm} style={{width: 150}}>
      <input type="hidden" defaultValue={props.id} name="id"/>
      <textarea defaultValue={props.description || '123'} name="description" rows={4} cols={40} />
      <button type="submit">verstuur</button>
    </form>
  );

}

export default CommentForm;
