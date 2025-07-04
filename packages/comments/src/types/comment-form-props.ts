import {BaseProps, Comment} from '@openstad-headless/types';

export type CommentFormProps = BaseProps & {
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
  minCharactersWarning?: string;
  maxCharactersWarning?: string;
  minCharactersError?: string;
  maxCharactersError?: string;
  extraFieldsTagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
};
