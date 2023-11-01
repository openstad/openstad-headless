export type Idea = {
  id: number;
  userVote: {
    opinion: string;
  };
  yes: number;
  no: number;
  submitLike: any;
};
