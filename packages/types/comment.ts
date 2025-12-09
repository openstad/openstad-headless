// This should be typed from the datastore, not here.
export type Comment = {
  id: number;
  delete: (arg: number) => void;
  submitLike: () => void;
  submitDislike: () => void;
} & Partial<{
  parentId: number;
  resourceId: number;
  userId: number;
  sentiment: string;
  description: string;
  label: string;
  yes: number;
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  createDateHumanized: string;

  replies: Array<Comment>;

  user?: { displayName: string, role: string};
  submitLike: () => void;

  tags?: Array<{
    id: string;
    name: string;
    type: string;
  }>;

  can?: {
    reply: boolean;
    delete: boolean;
    edit: boolean;
  };
}>;
