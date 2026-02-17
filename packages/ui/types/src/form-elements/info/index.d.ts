import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';

export type InfoFieldProps = {
  overrideDefaultValue?: FormValue;
  title?: string;
  description?: string;
  fieldKey?: string;
  type?: string;
  image?: string;
  imageAlt?: string;
  imageDescription?: string;
  infoBlockStyle?: string;
  infoBlockShareButton?: boolean;
  infoBlockExtraButton?: string;
  infoBlockExtraButtonTitle?: string;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
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
};
declare const InfoField: FC<InfoFieldProps>;
export default InfoField;
