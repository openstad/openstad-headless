import {Comment} from '@openstad-headless/types';

export type CommentProps = {
  comment: Comment;
  showDateSeperately?: boolean;
  submitComment?: (e: any) => void;
};
