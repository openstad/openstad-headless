export type Reaction = {
  id?: string;
  userId: string;
  name: string;
  description: string;
  date: Date;
  reactionsOnArgument: Array<Reaction>;
};
