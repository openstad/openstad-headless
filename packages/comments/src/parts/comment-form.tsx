import React, { useContext } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import Form from '@openstad-headless/form/src/form';
import type { CombinedFieldPropsWithType } from '@openstad-headless/form/src/props';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { CommentWidgetContext } from '../comments';
import { CommentFormProps } from '../types/comment-form-props';
import DataStore from "@openstad-headless/data-store/src";

function CommentForm({
  comment,
  descriptionMinLength = 30,
  descriptionMaxLength = 500,
  formIntro = 'Test',
  placeholder = 'Typ hier uw reactie',
  parentId = 0,
  activeMode = '',
  sentiment = '',
  disableSubmit = false,
  maxCharactersWarning = 'Je hebt nog {maxCharacters} tekens over',
  minCharactersWarning = 'Nog minimaal {minCharacters} tekens',
  minCharactersError = 'Tekst moet minimaal {minCharacters} karakters bevatten',
  maxCharactersError = 'Tekst moet maximaal {maxCharacters} karakters bevatten',
  extraFieldsTagGroups = [],
  ...props
}: CommentFormProps) {
  const commentsContext = useContext(CommentWidgetContext);

  const args = {
    comment,
    descriptionMinLength,
    descriptionMaxLength,
    maxCharactersWarning,
    minCharactersWarning,
    minCharactersError,
    maxCharactersError,
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
    maxCharactersWarning: maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over',
    minCharactersWarning: minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
    minCharactersError: minCharactersError || 'Tekst moet minimaal {minCharacters} karakters bevatten',
    maxCharactersError: maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten',
  });

  if (
    !parentId
    && !(args?.comment?.parentId)
    && extraFieldsTagGroups
    && Array.isArray(extraFieldsTagGroups)
    && extraFieldsTagGroups.length > 0
  ) {
    const datastore = new DataStore({
      projectId: props.projectId,
      api: props.api,
    });

    const {data: allTags} = datastore.useTags({
      projectId: props.projectId,
      type: ''
    });

    extraFieldsTagGroups.map((tagGroup) => {
      const options = !!allTags ?
        allTags
          .filter((tag: any) => tag.type === tagGroup.type)
          .map((tag: any) => ({
            label: tag.name, value: tag.id
          }))
        : [];

      const defaultValue = args.comment?.tags?.map((tag: any) => {
        if (tag.type === tagGroup.type) {
          return tag.id;
        }})
        ?.filter((id: any) => !!id)
          || [];

      formFields.push({
        type: 'select',
        title: tagGroup.label || 'Tags',
        fieldKey: `tags-${tagGroup.type}`,
        fieldRequired: false,
        multiple: !!tagGroup.multiple,
        choices: options,
        defaultValue: defaultValue.length ? defaultValue : []
      })
    })
  }

  formFields.push({
    type: 'hidden',
    fieldKey: 'sentiment',
    defaultValue: sentiment === 'none' ? 'no sentiment' : sentiment,
  });

  if (
    typeof args.comment !== 'undefined' &&
    !!parentId &&
    activeMode === 'reply'
  ) {
    formFields.push({
      type: 'hidden',
      fieldKey: 'parentId',
      defaultValue: parentId.toString(),
    });
  }

  if (
    typeof args.comment !== 'undefined' &&
    typeof args.comment.parentId !== 'undefined' &&
    !!args.comment.parentId &&
    activeMode === 'edit'
  ) {
    formFields.push({
      type: 'hidden',
      fieldKey: 'parentId',
      defaultValue: args.comment.parentId.toString(),
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
        submitDisabled={disableSubmit}
        submitHandler={props.submitComment}
        submitText="Verstuur"
        title=""
      />
    </div>
  );
}

export { CommentForm as default, CommentForm };
