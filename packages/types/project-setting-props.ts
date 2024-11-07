export type ProjectSettingProps = {
  allowedDomains: Array<string>;
  project: {
    endDate: Date;
    endDateNotificationSent: boolean;
    projectHasEnded: boolean;
    areaId: string;
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
    modbreakTitle?: string;
    types: Array<string>;
  };
  comments: {
    canComment: boolean,
    canLike: boolean,
    canReply: boolean,
    closedText: string;
    requiredUserRole: string,
    descriptionMinLength: number,
    descriptionMaxLength: number,
    adminLabel: string,
  };
  users: {
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
  map: {
    minZoom: string;
    maxZoom: string;
    areaId: string;
    tilesVariant?: string;
    customUrl?: string;
  };
};
