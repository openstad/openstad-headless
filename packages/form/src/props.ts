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

export type FormProps = {
    title?: string;
    fields: Array<CombinedFieldProps>;
    submitText?: string;
    submitHandler: (values: { [p: string]: string | Record<number, never> | []}) => void;
    getValuesOnChange?: (values: { [p: string]: string | Record<number, never> | []}) => void;
    submitDisabled?: boolean;
    allowResetAfterSubmit?: boolean;
    secondaryLabel?: string;
    secondaryHandler?: (values: { [p: string]: string | Record<number, never> | []}) => void;
    placeholder?: string;
}

type CombinedFieldPropsWithType =
    | ({ type?: 'text' } & TextInputProps)
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
    | ({ type?: 'none' } & InfoFieldProps);

type ComponentFieldProps = (
    {
        index?: number,
    }
    & CombinedFieldProps
)

type CombinedFieldProps = (
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
    InfoFieldProps
);

export type { CombinedFieldProps as FieldProps, CombinedFieldPropsWithType, ComponentFieldProps};
