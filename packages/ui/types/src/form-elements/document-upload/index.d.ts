import { FormValue } from '@openstad-headless/form/src/form';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import { FC } from 'react';

import './document-upload.css';

export type DocumentUploadProps = {
  title: string;
  overrideDefaultValue?:
    | FormValue
    | {
        name: string;
        url: string;
      }[];
  description?: string;
  fieldRequired?: boolean;
  requiredWarning?: string;
  fieldKey: string;
  allowedTypes?: string[];
  disabled?: boolean;
  multiple?: boolean;
  type?: string;
  onChange?: (
    e: {
      name: string;
      value: {
        name: string;
        url: string;
      }[];
    },
    triggerSetLastKey?: boolean
  ) => void;
  imageUrl?: string;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
  randomId?: string;
  fieldInvalid?: boolean;
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
declare const DocumentUploadField: FC<DocumentUploadProps>;
export default DocumentUploadField;
