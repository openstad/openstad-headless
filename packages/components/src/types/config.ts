import { Idea } from './idea';

export type WidgetConfig = {
  apiUrl?: string;
  projectId?: number;
  login?: {
    url: string;
  };
  idea?: Idea;
  votes?: {
    isActive: boolean;
    requiredUserRole: string;
    voteType: string;
    voteValues: Array<{
      label: string;
      value: 'yes' | 'no';
    }>;
  };
  type?: string;
  config: {
    api?: {
      url?: string;
    };
    type?: string;

    projectId?: number;
    ideaId?: number;
    sentiment?: string;
    cmsUser?: null;
    openStadUser?: null;
    title?: string;
    isClosed?: boolean;
    closedText?: string;
    isVotingEnabled?: boolean;
    isReplyingEnabled?: boolean;
    descriptionMinLength?: number;
    descriptionMaxLength?: number;
    placeholder?: string;
    formIntro?: string;
    divId?: string;
  };
};
