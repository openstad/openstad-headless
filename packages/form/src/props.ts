import { TextInputProps } from '@openstad-headless/ui/src/form-elements/text/props';
import { TickmarkSliderProps } from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import { RangeSliderProps } from "@openstad-headless/ui/src/form-elements/a-b-slider";
import { CheckboxFieldProps } from "@openstad-headless/ui/src/form-elements/checkbox";
import { SelectFieldProps } from "@openstad-headless/ui/src/form-elements/select";
import { RadioboxFieldProps } from "@openstad-headless/ui/src/form-elements/radio";
import { FileUploadProps} from "@openstad-headless/ui/src/form-elements/file-upload";

export type FormProps = {
    title?: string;
    fields: CombinedFieldProps[];
    submitText?: string;
    submitHandler: (data: any) => void;
    saveAsConceptLabel?: string;
    saveAsConceptHandler?: (data: any) => void;
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
