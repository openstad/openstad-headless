import type { TextInputProps } from '@openstad-headless/ui/src/form-elements/text';
import type { TickmarkSliderProps } from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import type { RangeSliderProps } from "@openstad-headless/ui/src/form-elements/a-b-slider";
import type { CheckboxFieldProps } from "@openstad-headless/ui/src/form-elements/checkbox";
import type { SelectFieldProps } from "@openstad-headless/ui/src/form-elements/select";
import type { RadioboxFieldProps } from "@openstad-headless/ui/src/form-elements/radio";
import type { FileUploadProps} from "@openstad-headless/ui/src/form-elements/file-upload";
import type { HiddenInputProps } from "@openstad-headless/ui/src/form-elements/hidden";
import type {ImageChoiceFieldProps} from "@openstad-headless/ui/src/form-elements/image-choice";

export type FormProps = {
    title?: string;
    fields: Array<CombinedFieldProps>;
    submitText?: string;
    submitHandler: (values: { [p: string]: string | FileList | []}) => void;
    submitDisabled?: boolean;
    secondaryLabel?: string;
    secondaryHandler?: (values: { [p: string]: string | FileList | []}) => void;
}

type CombinedFieldPropsWithType =
    | ({ type?: 'text' } & TextInputProps)
    | ({ type?: 'tickmark-slider' } & TickmarkSliderProps)
    | ({ type?: 'range' } & RangeSliderProps)
    | ({ type?: 'checkbox' } & CheckboxFieldProps)
    | ({ type?: 'select' } & SelectFieldProps)
    | ({ type?: 'radiobox' } & RadioboxFieldProps)
    | ({ type?: 'upload' } & FileUploadProps)
    | ({ type?: 'hidden' } & HiddenInputProps)
    | ({ type?: 'imageChoice' } & ImageChoiceFieldProps);

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
    FileUploadProps |
    HiddenInputProps |
    ImageChoiceFieldProps
);

export type { CombinedFieldProps as FieldProps, CombinedFieldPropsWithType, ComponentFieldProps};
