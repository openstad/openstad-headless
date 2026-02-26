import { FC } from 'react';

export type SortFieldProps = {
  title?: string;
  description?: string;
  fieldKey?: string;
  type?: string;
  image?: string;
  imageAlt?: string;
  imageDescription?: string;
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
};
declare const SortField: FC<SortFieldProps>;
export default SortField;
