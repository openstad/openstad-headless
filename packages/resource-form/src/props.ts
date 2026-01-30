import { Matrix } from '@openstad-headless/enquete/src/types/enquete-props';
import { DataLayer } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';

export type ResourceFormWidgetProps = BaseProps &
  ProjectSettingProps &
  ResourceFormWidget;

export type ResourceFormWidget = {
  widgetId?: number;
  displayTitle?: boolean;
  title?: string;
  displayDescription?: boolean;
  description?: string;
  submit?: Submit;
  items?: Array<Item>;
  info?: Info;
  confirmation?: Confirmation;
  redirectUrl?: string;
  placeholder?: string;
  datalayer?: DataLayer[];
  enableOnOffSwitching?: boolean;
  allowedPolygons?: Array<{ id: number; name: string }>;
};

export type General = {
  resource?:
    | 'resource'
    | 'article'
    | 'activeUser'
    | 'resourceUser'
    | 'submission';
  formName?: string;
  redirectUrl?: string;
  hideAdmin?: boolean;
  showMinMaxAfterBlur?: boolean,
};

export type Confirmation = {
  confirmationUser?: boolean;
  confirmationAdmin?: boolean;
};

export type Submit = {
  submitButton?: string;
  saveButton?: string;
  saveConceptButton?: string;
  defaultAddedTags?: string;
};

export type Info = {
  allowAnonymousSubmissions?: boolean;
  loginText?: string;
  loginButtonText?: string;
  nameInHeader?: boolean;
};

export type Item = {
  trigger: string;
  title?: string;
  description?: string;
  type?: string;
  fieldType?: string;
  prevPageText?: string;
  nextPageText?: string;
  tags?: string;
  fieldKey: string;
  fieldRequired?: boolean;
  onlyForModerator?: boolean;
  minCharacters?: string;
  maxCharacters?: string;
  variant?: string;
  multiple?: boolean;
  images?: Array<{
    image?: never;
    src: string;
  }>;
  options?: Array<Option>;
  placeholder?: string;
  defaultValue?: string;
  maxChoices?: string;
  maxChoicesMessage?: string;
  matrix?: Matrix;
  matrixMultiple?: boolean;
  routingInitiallyHide?: boolean;
  routingSelectedQuestion?: string;
  routingSelectedAnswer?: string;
  selectAll?: boolean;
  selectAllLabel?: string;
};

export type Option = {
  trigger: string;
  titles: Array<Title>;
  images?: Array<{
    image?: never;
    src: string;
  }>;
};

export type Title = {
  text?: string;
  key: string;
  isOtherOption?: boolean;
  defaultValue?: boolean;
  weights?: Record<string, Weight>;
};

type Weight = {
  weightX: string | number;
  weightY: string | number;
};
