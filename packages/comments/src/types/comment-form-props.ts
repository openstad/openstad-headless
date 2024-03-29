import CommentType from '../../../types/comment';

export type CommentFormProps = {
  comment?: CommentType;
  descriptionMinLength?: number;
  descriptionMaxLength?: number;
  placeholder?: string;
  formIntro?: string;
  submitComment: (e: any) => void;
};
