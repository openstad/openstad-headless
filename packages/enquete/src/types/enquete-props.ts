import { DataLayer } from "@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props";

export type EnqueteProps = {
  widgetId?: number;
  afterSubmitUrl?: string;
  displayTitle?: boolean;
  title?: string;
  displayDescription?: boolean;
  description?: string;
  items?: Array<Item>;
  formVisibility?: string;
  formStyle?: string;
  imageUrl?: string;
  multiple?: boolean;
  confirmation?: Confirmation;
  minCharactersWarning?: string;
  maxCharactersWarning?: string;
  minCharactersError?: string;
  maxCharactersError?: string;
  datalayer?: DataLayer[];
  enableOnOffSwitching?: boolean;
  infoBlockStyle?: string;
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
  nextPageText?: string;
  prevPageText?: string;
  variant?: string;
  options?: Array<Option>;
  imageUpload?: string;
  multiple?: boolean;
  image?: string;
  imageAlt?: string;
  imageDescription?: string;
  infoBlockStyle?: string;
  infoBlockShareButton?: boolean;
  infoBlockExtraButton?: string;
  fieldRequired?: boolean;
  maxChoices?: string,
  maxChoicesMessage?: string,
  showSmileys?: boolean;
  placeholder?: string;
  defaultValue?: string;
  imageOptionUpload?: string;
  matrix?: Matrix;
  matrixMultiple?: boolean;
  routingInitiallyHide?: boolean;
  routingSelectedQuestion?: string;
  routingSelectedAnswer?: string;
  infoField?: string;

  // Keeping this for backwards compatibility
  image1?: string;
  text1?: string;
  key1?: string;
  image2?: string;
  text2?: string;
  key2?: string;
};

export type Option = {
  trigger: string;
  titles: Array<Title>;
};

export type Title = {
  text?: string;
  key: string;
  infoField?: string;
  isOtherOption?: boolean;
  defaultValue?: boolean;
  image?: string;
  hideLabel?: boolean;
  description?: string;
};

export type Confirmation = {
  confirmationUser?: boolean;
  confirmationAdmin?: boolean;
  overwriteEmailAddress?: string;
  userEmailAddress?: string;
};

export type Matrix = {
  columns: Array<MatrixOption>;
  rows: Array<MatrixOption>;
}

export type MatrixOption = {
  trigger: string;
  text?: string;
}