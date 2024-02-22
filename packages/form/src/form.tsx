import React, { FC, useState } from 'react';
import {FormProps, FieldProps, CombinedFieldPropsWithType, ComponentFieldProps} from "./props";
import TextInput from "@openstad-headless/ui/src/form-elements/text";
import RangeSlider from "@openstad-headless/ui/src/form-elements/a-b-slider";
import CheckboxField from "@openstad-headless/ui/src/form-elements/checkbox";
import RadioboxField from "@openstad-headless/ui/src/form-elements/radio";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import TickmarkSlider from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import FileUploadField from "@openstad-headless/ui/src/form-elements/file-upload";
import MapField from "@openstad-headless/ui/src/form-elements/map";
import { handleSubmit } from "./submit";
import HiddenInput from "@openstad-headless/ui/src/form-elements/hidden/index.js";
import ImageChoiceField from "@openstad-headless/ui/src/form-elements/image-choice/index.js";

const Form: FC<FormProps> = ({
     title = 'Form Widget',
     fields = [],
     submitText = 'Verzenden',
     submitHandler = () => {},
     submitDisabled = false,
     saveAsConceptLabel = '',
     saveAsConceptHandler = () => {},
 }) => {
    const initialFormValues: { [key: string]: any } = {};
    fields.forEach((field) => {
        if (field.fieldKey) {
            //@ts-ignore
            initialFormValues[field.fieldKey] = typeof field.defaultValue !== 'undefined' ? field.defaultValue :'';
        }
    });

    const [formValues, setFormValues] = useState(initialFormValues);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleSubmit(fields, formValues, setFormErrors, submitHandler);
    };

    const handleInputChange = (event: {name: string, value: string | []}) => {
        const { name, value } = event;
        setFormValues({ ...formValues, [name]: value });
    };

    const componentMap: { [key: string]: React.ComponentType<ComponentFieldProps> } = {
        text: TextInput as React.ComponentType<ComponentFieldProps>,
        range: RangeSlider as React.ComponentType<ComponentFieldProps>,
        checkbox: CheckboxField as React.ComponentType<ComponentFieldProps>,
        radiobox: RadioboxField as React.ComponentType<ComponentFieldProps>,
        select: SelectField as React.ComponentType<ComponentFieldProps>,
        'tickmark-slider': TickmarkSlider as React.ComponentType<ComponentFieldProps>,
        upload: FileUploadField as React.ComponentType<ComponentFieldProps>,
        map: MapField as React.ComponentType<ComponentFieldProps>,
        hidden: HiddenInput as React.ComponentType<ComponentFieldProps>,
        imageChoice: ImageChoiceField as React.ComponentType<ComponentFieldProps>,
    };

    const renderField = (field: CombinedFieldPropsWithType, index: number) => {
        if (!field.type) {
            return null;
        }
      const Component = componentMap[field.type];
      if (Component) {
        return (
          <Component
            {...field}
            index={index}
            onChange={handleInputChange}
          />
        );
      }
    };

    return (
        <div className="form-widget">
            <div className="form-widget-container">
                {title ? <h5 className="form-widget-title">{title}</h5> : null}

                <form onSubmit={handleFormSubmit} className="form-container" noValidate>
                    {fields.map((field: CombinedFieldPropsWithType, index: number) => (
                        <div key={index} className={`question-type-${field.type}`}>
                            {renderField(field, index)}
                            <div className="error-message">
                                {formErrors[field.fieldKey] && <span>{formErrors[field.fieldKey]}</span>}
                            </div>
                        </div>
                    ))}
                    {saveAsConceptLabel && (
                        <button type="button" onClick={() => saveAsConceptHandler(formValues)}>{saveAsConceptLabel}</button>
                    )}
                    <button type="submit" disabled={submitDisabled}>
                        {submitText}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Form;
