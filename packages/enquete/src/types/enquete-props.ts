export type EnqueteProps = {
  displayTitle?: boolean;
  title?: string;
  displayDescription?: boolean;
  description?: string;
  items?: Array<Item>;
};

export type Item = {
  trigger: string;
  title?: string;
  key: string;
  description?: string;
  questionType?: string;
  images?: Array<{
    image?: any;
    src: string;
  }>;
  options?: Array<Option>;
};

export type Option = {
  trigger: string;
  titles: Array<Title>;
  images?: Array<{
    image?: any;
    src: string;
  }>;
};

export type Title = {
  text: string;
  key: string;
};
