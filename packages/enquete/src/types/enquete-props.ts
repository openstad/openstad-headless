export type EnqueteProps = {
  widgetId?: number;
  afterSubmitUrl?: string;
  displayTitle?: boolean;
  title?: string;
  displayDescription?: boolean;
  description?: string;
  items?: Array<Item>;
  formVisibility?: string;
  imageUrl?: string;
  multiple?: boolean;
  confirmation?: Confirmation;
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
  image1?: string;
  text1?: string;
  key1?: string;
  image2?: string;
  text2?: string;
  key2?: string;
  options?: Array<Option>;
  imageUpload?: string;
  multiple?: boolean;
  image?: string;
  imageAlt?: string;
  imageDescription?: string;
  fieldRequired?: boolean;
  showSmileys?: boolean;
  placeholder?: string;
};

export type Option = {
  trigger: string;
  titles: Array<Title>;
};

export type Title = {
  text: string;
  key: string;
  isOtherOption?: boolean;
};

export type Confirmation = {
  confirmationUser?: boolean;
  confirmationAdmin?: boolean;
  overwriteEmailAddress?: string;
  userEmailAddress?: string;
};
