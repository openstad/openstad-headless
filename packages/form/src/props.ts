import { TextInputProps } from '@openstad-headless/ui/src/form-elements/text/props';
import { TickmarkSliderProps } from "@openstad-headless/ui/src/form-elements/tickmark-slider/props.js";
import { RangeSliderProps } from "@openstad-headless/ui/src/form-elements/a-b-slider/props.js";
import { CheckboxFieldProps } from "@openstad-headless/ui/src/form-elements/checkbox/props.js";
import { SelectFieldProps } from "@openstad-headless/ui/src/form-elements/select/props.js";
import { RadioboxFieldProps } from "@openstad-headless/ui/src/form-elements/radio/props.js";
import { FileUploadProps} from "@openstad-headless/ui/src/form-elements/file-upload/props.js";

export interface FormProps {
    title?: string;
    fields: CombinedFieldProps[];
    submitText?: string;
    submitHandler: (data: any) => void;
}

type CombinedFieldProps = (
    TextInputProps |
    TickmarkSliderProps |
    RangeSliderProps |
    CheckboxFieldProps |
    SelectFieldProps |
    RadioboxFieldProps |
    FileUploadProps
);

export { CombinedFieldProps as FieldProps };
