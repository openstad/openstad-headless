import {Comment} from '@openstad-headless/types';

export type CommentProps = {
  comment: Comment;
  selected?: boolean;
  type?: string;
  index?: number;
  showDateSeperately?: boolean;
  submitComment?: (e: any) => void;
};
