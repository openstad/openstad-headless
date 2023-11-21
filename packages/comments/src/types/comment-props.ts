import CommentType from '../../types/comment.ts';

type Props = {
  comment: CommentType;
  sentiment: string;
  emptyListText: string;
  commentsIsOpen: boolean;
  commentIsClosedText: string;
  isVotingEnabled: boolean;
  isReplyingEnabled: boolean;
  requiredUserRole: boolean;
  userNameFields: Array<string>;
};

export {
  Props as default,
}
