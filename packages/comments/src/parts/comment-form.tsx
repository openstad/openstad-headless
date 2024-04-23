import React, { useContext } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import Form from '@openstad-headless/form/src/form';
import type { CombinedFieldPropsWithType } from '@openstad-headless/form/src/props';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { CommentWidgetContext } from '../comments';
import { CommentFormProps } from '../types/comment-form-props';

function CommentForm({
  comment,
  descriptionMinLength = 30,
  descriptionMaxLength = 500,
  formIntro = 'Test',
  placeholder = 'Type hier uw reactie',
  parentId = 0,
  activeMode = '',
  sentiment = '',
  ...props
}: CommentFormProps) {
  const commentsContext = useContext(CommentWidgetContext);

  const args = {
    comment,
    descriptionMinLength,
    descriptionMaxLength,
    ...props,
  } as CommentFormProps;

  const formFields: Array<CombinedFieldPropsWithType> = [];

  formFields.push({
    type: 'text',
    title: '',
    variant: 'textarea',
    minCharacters: descriptionMinLength,
    maxCharacters: descriptionMaxLength,
    fieldRequired: false,
    requiredWarning: 'Dit veld is verplicht',
    fieldKey: 'description',
    placeholder: commentsContext?.placeholder,
    defaultValue: !parentId ? args.comment?.description : '',
  });

  formFields.push({
    type: 'hidden',
    fieldKey: 'sentiment',
    defaultValue: sentiment,
  });

  if (
    typeof args.comment !== 'undefined' &&
    !!parentId &&
    activeMode === 'reply'
  ) {
    formFields.push({
      type: 'hidden',
      fieldKey: 'parentId',
      defaultValue: parentId,
    });
  }

  if (
    typeof args.comment !== 'undefined' &&
    typeof args.comment.id !== 'undefined' &&
    activeMode === 'edit'
  ) {
    formFields.push({
      type: 'hidden',
      fieldKey: 'id',
      defaultValue: args.comment.id.toString(),
    });
  }

  if (!commentsContext) {
    return null;
  }

  return (
    <div className="reaction-input-container">
      {commentsContext.formIntro && <p>{commentsContext.formIntro}</p>}
      <Spacer size={1} />
      {args.formIntro && <p>{args.formIntro}</p>}
      <Form
        fields={formFields}
        submitHandler={props.submitComment}
        submitText="Verstuur"
        title=""
      />
    </div>
  );
}

export { CommentForm as default, CommentForm };
