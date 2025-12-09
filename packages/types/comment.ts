// This should be typed from the datastore, not here.
export type Comment = {
  id: number;
  delete: (arg: number) => void;
  submitLike: () => Comment;
  submitDislike: () => Comment;
} & Partial<{
  parentId: number;
  resourceId: number;
  userId: number;
  sentiment: string;
  description: string;
  label: string;
  yes: number;
  no: number;
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  createDateHumanized: string;

  replies: Array<Comment>;

  user?: { displayName: string, role: string};

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
