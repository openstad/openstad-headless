import {Comment} from '@openstad-headless/types';

export type CommentFormProps = {
  comment?: Comment;
  descriptionMinLength?: number;
  descriptionMaxLength?: number;
  placeholder?: string;
  formIntro?: string;
  submitComment: (e: any) => void;
};
