type Props = {
  ideaId: number;
  requiredUserRole: string;
  title?: string,
  sentiment?: string;
  emptyListText?: string;
  isVotingEnabled: boolean;
  isReplyingEnabled: boolean;
  isClosed?: boolean,
  isClosedText?: string,
  placeholder?: string,
  userNameFields: Array<string>;
  descriptionMaxLength?: number,
};

export {
  Props as default,
}
