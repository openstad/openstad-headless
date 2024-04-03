export type EnqueteProps = {
  widgetId?: number;
  afterSubmitUrl?: string;
  displayTitle?: boolean;
  title?: string;
  displayDescription?: boolean;
  description?: string;
  items?: Array<Item>;
  formVisibility?: string;
};

export type Item = {
  trigger: string;
  title?: string;
  key: string;
  description?: string;
  questionType?: string;
  fieldKey?: string;
  minCharacters?: string;
  maxCharacters?: string;
  variant?: string;
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
