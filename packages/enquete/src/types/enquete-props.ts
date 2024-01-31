export type EnqueteProps = {
  displayTitle?: boolean;
  title?: string;
  displayDescription?: boolean;
  description?: string;
  items?: Array<Item>;
};

type Item = {
  trigger: string;
  title?: string;
  description?: string;
  questionType?: string;
  images?: Array<{
    src: string;
  }>;
  options: Array<Option>;
};

type Option = {
  trigger: string;
  key: string;
  titles: Array<string>;
  images: Array<{
    src: string;
  }>;
};
