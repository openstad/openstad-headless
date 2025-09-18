import { FC } from "react";
import 'filepond/dist/filepond.min.css';
import './image-upload.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
export type ImageUploadProps = {
    title: string;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    allowedTypes?: string[];
    disabled?: boolean;
    multiple?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: {
            name: string;
            url: string;
        }[];
    }, triggerSetLastKey?: boolean) => void;
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
};
declare const ImageUploadField: FC<ImageUploadProps>;
export default ImageUploadField;
