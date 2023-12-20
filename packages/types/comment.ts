type Comment = {
  parentId: number;
  resourceId: number;
  userId: number;
  sentiment: string;
  description: string;
  label: string;
  yes: number;
  hasUserVoted: boolean;
  createDateHumanized: string;
};

export {
  Comment as default,
}
