import { FormValue } from '@openstad-headless/form/src/form';
import { FC } from 'react';

export type CheckboxFieldProps = {
  title: string;
  overrideDefaultValue?: FormValue;
  description?: string;
  choices?: {
    value: string;
    label: string;
    isOtherOption?: boolean;
    defaultValue?: boolean;
  }[];
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
  maxChoices?: string;
  maxChoicesMessage?: string;
  randomId?: string;
  fieldInvalid?: boolean;
  defaultValue?: string;
  prevPageText?: string;
  nextPageText?: string;
  fieldOptions?: {
    value: string;
    label: string;
  }[];
  randomizeItems?: boolean;
};
declare const CheckboxField: FC<CheckboxFieldProps>;
export default CheckboxField;
