import merge from 'merge';
import { useState, useEffect, useCallback } from 'react';
import Button from '../button';

function CommentForm(props) {

  props = merge.recursive({}, {
    descriptionMinLength: 30,
    descriptionMaxLength: 500,
    placeholder: '',
    formIntro: '',
  }, props.config,  props);


  return (
    <form  onSubmit={props.submitComment} style={{width: 150}}>
      <input type="hidden" defaultValue={props.id} name="id"/>
      <input type="hidden" defaultValue={props.sentiment} name="sentiment"/>
      <textarea defaultValue={props.description || '123'} name="description" rows={4} cols={40} />
      <Button type="submit">Verstuur</Button>
    </form>
  );

}

export default CommentForm;
