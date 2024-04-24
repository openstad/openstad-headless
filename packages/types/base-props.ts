export type BaseProps = {
  projectId?: string;
  api?: {
    url: string;
  };
  login?: {
    label?: string;
    url: string;
    anonymous?: {
      label?: string;
      url: string;
    };
  };
  logout?: {
    label?: string;
    url: string;
  };
  cmsUser?: {
    access_token: string;
    iss: string;
    provider: string;
  };
  openStadUser?: {
    access_token: string;
    iss: string;
    provider: string;
  };
};
