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

  let parentIdHTML = null;
  if (props.parentId) {
    parentIdHTML = <input type="hidden" defaultValue={props.parentId} name="parentId"/>
  }
  
  return (
    <form  onSubmit={props.submitComment} style={{width: 150}}>
      <input type="hidden" defaultValue={props.id} name="id"/>
      {parentIdHTML}
      <input type="hidden" defaultValue={props.sentiment} name="sentiment"/>
      <textarea defaultValue={props.description || 'Praesent at accumsan diam. Nullam ac tortor euismod, aliquet mauris a, placerat metus. Vivamus imperdiet urna ut sem dapibus placerat.'} name="description" rows={4} cols={40} />
      <Button type="submit">Verstuur</Button>
    </form>
  );

}

export default CommentForm;
