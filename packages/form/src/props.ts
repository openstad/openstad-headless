import type { TextInputProps } from '@openstad-headless/ui/src/form-elements/text';
import type { TickmarkSliderProps } from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import type { RangeSliderProps } from "@openstad-headless/ui/src/form-elements/a-b-slider";
import type { CheckboxFieldProps } from "@openstad-headless/ui/src/form-elements/checkbox";
import type { SelectFieldProps } from "@openstad-headless/ui/src/form-elements/select";
import type { RadioboxFieldProps } from "@openstad-headless/ui/src/form-elements/radio";
import type { ImageUploadProps} from "@openstad-headless/ui/src/form-elements/image-upload";
import type { DocumentUploadProps} from "@openstad-headless/ui/src/form-elements/document-upload";
import type { HiddenInputProps } from "@openstad-headless/ui/src/form-elements/hidden";
import type {ImageChoiceFieldProps} from "@openstad-headless/ui/src/form-elements/image-choice";
import type {MapProps} from "@openstad-headless/ui/src/form-elements/map";
import type {InfoFieldProps} from "@openstad-headless/ui/src/form-elements/info";
import type {NumberInputProps} from "@openstad-headless/ui/src/form-elements/number";
import type {SortFieldProps} from "@openstad-headless/ui/src/form-elements/sort";
import {MatrixFieldProps} from "@openstad-headless/ui/src/form-elements/matrix";
import { FormValue } from "@openstad-headless/form/src/form";

export type FormProps = {
    title?: string;
    fields: Array<FieldWithOptionalFields>;
    fieldKey?: any;
    submitText?: string;
    submitHandler: (values: { [p: string]: FormValue}) => void;
    getValuesOnChange?: (values: { [p: string]: FormValue}, hiddenFields?: string[]) => void;
    submitDisabled?: boolean;
    allowResetAfterSubmit?: boolean;
    secondaryLabel?: string;
    secondaryHandler?: (values: { [p: string]: FormValue}) => void;
    placeholder?: string;
    currentPage?: any;
    setCurrentPage?: (page: number) => void;
    prevPage?: any;
    prevPageText?: string;
    pageFieldStartPositions?: number[];
    pageFieldEndPositions?: number[];
    totalPages?: number;
    showBackButtonInTopOfPage?: boolean;
    totalFieldCount?: number;
    formStyle?: string;
}

type PaginationFieldProps = {
    type: 'pagination';
    fieldKey?: string;
    prevPageText?: any;
    nextPageText?: any;
    defaultValue?: string;
    infoBlockStyle?: string;
};

type CombinedFieldPropsWithType =
    | ({ type?: 'text' } & TextInputProps)
    | ({ type?: 'number' } & NumberInputProps)
    | ({ type?: 'tickmark-slider' } & TickmarkSliderProps)
    | ({ type?: 'range' } & RangeSliderProps)
    | ({ type?: 'checkbox' } & CheckboxFieldProps)
    | ({ type?: 'select' } & SelectFieldProps)
    | ({ type?: 'radiobox' } & RadioboxFieldProps)
    | ({ type?: 'imageUpload' } & ImageUploadProps)
    | ({ type?: 'documentUpload' } & DocumentUploadProps)
    | ({ type?: 'hidden' } & HiddenInputProps)
    | ({ type?: 'imageChoice' } & ImageChoiceFieldProps)
    | ({ type?: 'map' } & MapProps)
    | ({ type?: 'matrix' } & MatrixFieldProps)
    | ({ type?: 'pagination' } & PaginationFieldProps)
    | ({ type?: 'sort' } & SortFieldProps)
    | ({ type?: 'none' } & InfoFieldProps);

type ComponentFieldProps = (
    {
        index?: number,
    }
    & CombinedFieldProps
)

type CombinedFieldProps = (
    PaginationFieldProps|
    TextInputProps |
    TickmarkSliderProps |
    RangeSliderProps |
    CheckboxFieldProps |
    SelectFieldProps |
    RadioboxFieldProps |
    ImageUploadProps |
    DocumentUploadProps |
    HiddenInputProps |
    ImageChoiceFieldProps |
    NumberInputProps |
    MatrixFieldProps |
    InfoFieldProps |
    SortFieldProps
    & {infoBlockStyle?: string;}
);

// These fields have no use outside the form component itself, so we make them optional here to avoid having to define them in every form field
type FieldWithOptionalFields =
  CombinedFieldProps & {
    trigger?: string
    routingInitiallyHide?: boolean;
    routingSelectedQuestion?: string;
    routingSelectedAnswer?: string;
    infoBlockStyle?: string;
}

export type { FieldWithOptionalFields, CombinedFieldProps as FieldProps, CombinedFieldPropsWithType, ComponentFieldProps};
