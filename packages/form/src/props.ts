import { TextInputProps } from '@openstad-headless/ui/src/form-elements/text';
import { TickmarkSliderProps } from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import { RangeSliderProps } from "@openstad-headless/ui/src/form-elements/a-b-slider";
import { CheckboxFieldProps } from "@openstad-headless/ui/src/form-elements/checkbox";
import { SelectFieldProps } from "@openstad-headless/ui/src/form-elements/select";
import { RadioboxFieldProps } from "@openstad-headless/ui/src/form-elements/radio";
import { FileUploadProps} from "@openstad-headless/ui/src/form-elements/file-upload";
import { HiddenInputProps } from "@openstad-headless/ui/src/form-elements/hidden";
import {ImageChoiceFieldProps} from "@openstad-headless/ui/src/form-elements/image-choice";

export type FormProps = {
    title?: string;
    fields: CombinedFieldProps[];
    submitText?: string;
    submitHandler: (data: any) => void;
    submitDisabled?: boolean;
    saveAsConceptLabel?: string;
    saveAsConceptHandler?: (data: any) => void;
}

type CombinedFieldPropsWithType = (
    ({type? : 'text'} & TextInputProps) |
    ({type? : 'tickmark-slider'} & TickmarkSliderProps) |
    ({type? : 'range'} & RangeSliderProps) |
    ({type? : 'checkbox'} & CheckboxFieldProps) |
    ({type? : 'select'} & SelectFieldProps) |
    ({type? : 'radiobox'} & RadioboxFieldProps) |
    ({type? : 'upload'} & FileUploadProps) |
    ({type? : 'hidden'} & HiddenInputProps)|
    ({type? : 'imageChoice'} & ImageChoiceFieldProps)
);

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
