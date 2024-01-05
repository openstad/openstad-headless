import CommentType from '../../../types/comment';

export type CommentProps = {
  comment: CommentType;
  sentiment: string;
  emptyListText: string;
  commentsIsOpen: boolean;
  commentIsClosedText: string;
  isVotingEnabled: boolean;
  isReplyingEnabled: boolean;
  requiredUserRole: string;
  userNameFields: Array<string>;
  showDateSeperately?: boolean;
  hideReplyAsAdmin?: boolean;
};
