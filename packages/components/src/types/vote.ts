export type Vote = {
  isActive: boolean;
  requiredUserRole: string;
  voteType: string;
  voteValues: Array<{
    label: string;
    value: string;
  }>;
};
