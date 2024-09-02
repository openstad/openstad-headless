import {Comment} from '@openstad-headless/types';

export type CommentFormProps = {
  activeMode?: 'edit' | 'reply' | '';
  comment?: Comment;
  descriptionMinLength?: number;
  descriptionMaxLength?: number;
  placeholder?: string;
  formIntro?: string;
  parentId?: number;
  sentiment?: string;
  submitComment: (e: any) => void;
  disableSubmit?: boolean;
};
