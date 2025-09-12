import { FC } from "react";
import { Matrix } from "@openstad-headless/enquete/src/types/enquete-props";
import './matrix.css';
export type MatrixFieldProps = {
    title: string;
    description?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {
        name: string;
        value: string | Record<number, never> | [] | string[];
    }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    matrixMultiple?: boolean;
    matrix?: Matrix;
    defaultValue?: string;
    fieldOptions?: {
        value: string;
        label: string;
    }[];
    nextPageText?: string;
    prevPageText?: string;
};
declare const MatrixField: FC<MatrixFieldProps>;
export default MatrixField;
