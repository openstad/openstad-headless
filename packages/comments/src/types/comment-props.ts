import CommentType from '../../../types/comment';

export type CommentProps = {
  comment: CommentType;
  showDateSeperately?: boolean;
  submitComment?: (e: any) => void;
};
