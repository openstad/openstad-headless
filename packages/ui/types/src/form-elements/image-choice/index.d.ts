import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';

export type ImageChoiceFieldProps = {
  title: string;
  overrideDefaultValue?: FormValue;
  description?: string;
  choices: ChoiceItem[];
  fieldRequired?: boolean;
  requiredWarning?: string;
  fieldKey: string;
  disabled?: boolean;
  type?: string;
  onChange?: (
    e: {
      name: string;
      value: FormValue;
    },
    triggerSetLastKey?: boolean
  ) => void;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
  randomId?: string;
  fieldInvalid?: boolean;
  multiple?: boolean;
  defaultValue?: string;
  prevPageText?: string;
  nextPageText?: string;
  fieldOptions?: {
    value: string;
    label: string;
  }[];
  images?: Array<{
    url: string;
    name?: string;
    imageAlt?: string;
    imageDescription?: string;
  }>;
  createImageSlider?: boolean;
  imageClickable?: boolean;
  infoField?: string;
  maxChoices?: string;
  maxChoicesMessage?: string;
};
export type ChoiceItem = {
  label: string;
  value: string;
  imageSrc: string;
  imageDescription: string;
  imageAlt: string;
  hideLabel?: boolean;
  description?: string;
};
declare const ImageChoiceField: FC<ImageChoiceFieldProps>;
export default ImageChoiceField;
