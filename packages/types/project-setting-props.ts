export type ProjectSettingProps = {
  allowedDomains: Array<string>;
  project: {
    endDate: Date;
    endDateNotificationSent: boolean;
    projectHasEnded: boolean;
  };
  anonymize: {
    anonymizeUsersXDaysAfterEndDate: number;
    warnUsersAfterXDaysOfInactivity: number;
    anonymizeUsersAfterXDaysOfInactivity: number;
  };
  auth: {
    default: string;
    adapter: {};
    provider: {};
  };
  resources: {
    canAddNewResources: boolean;
    titleMinLength: number;
    titleMaxLength: number;
    summaryMinLength: number;
    summaryMaxLength: number;
    descriptionMinLength: number;
    descriptionMaxLength: number;
    minimumYesVotes: number;
    showVoteButtons: boolean;
    canEditAfterFirstLikeOrComment: boolean;
    extraDataMustBeDefined: boolean;
    types: Array<string>;
  };

  comments: {
    new: {};
    isClosed: boolean;
    closedText: string;
  };
  users: {
    extraDataMustBeDefined: boolean;
    canCreateNewUsers: boolean;
    allowUseOfNicknames: boolean;
  };
  votes: {
    isViewable: boolean;
    isActive: boolean;
    requiredUserRole: string;
    mustConfirm: boolean;
    withExisting: string;
    voteType: string;
    voteValues: Array<{ label: string; value: string }>;
    maxResources: number;
    minResources: number;
    minBudget: number;
    maxBudget: number;
  };
  polls: {
    canAddPolls: boolean;
    requiredUserRole: string;
  };
  widgets: {
    beta: boolean;
    deprecated: boolean;
    visibleWidgets: Array<string>;
  };
  ignoreBruteForce: Array<string>;
};
