export type Status = {
  id: number;
  projectId: number;
  name: string;
  seqnr: number;
  addToNewResources: boolean;
  label?: string | null;
  color?: string | null;
  backgroundColor?: string | null;
  mapIcon?: string | null;
  listIcon?: string | null;
  extraFunctionality?: Record<string, unknown>;
  extraData?: Record<string, unknown>;
};
