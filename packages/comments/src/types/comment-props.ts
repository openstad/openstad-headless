import CommentType from '../../../types/comment';

export type CommentProps = {
  comment: CommentType;
  sentiment: string;
  emptyListText: string;
  isVotingEnabled: boolean;
  isReplyingEnabled: boolean;
  requiredUserRole: string;
  userNameFields: Array<string>;
  showDateSeperately?: boolean;
  hideReplyAsAdmin?: boolean;
};
