import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';

export type HiddenInputProps = {
  overrideDefaultValue?: FormValue;
  fieldKey: string;
  defaultValue: string;
  type?: string;
  onChange?: (
    e: {
      name: string;
      value: FormValue;
    },
    triggerSetLastKey?: boolean
  ) => void;
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
declare const HiddenInput: FC<HiddenInputProps>;
export default HiddenInput;
