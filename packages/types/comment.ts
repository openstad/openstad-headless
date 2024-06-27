// This should be typed from the datastore, not here.
export type Comment = {
  id: number;
  delete: (arg: number) => void;
  submitLike: () => void;
} & Partial<{
  parentId: number;
  resourceId: number;
  userId: number;
  sentiment: string;
  description: string;
  label: string;
  yes: number;
  hasUserVoted: boolean;
  createDateHumanized: string;

  replies: Array<Comment>;

  user?: { displayName: string, role: string};
  submitLike: () => void;

  can?: {
    reply: boolean;
    delete: boolean;
    edit: boolean;
  };
}>;