export type Reaction = {
  name: string;
  description: string;
  date: Date;
  reactionsOnArgument: Array<Reaction>;
};
