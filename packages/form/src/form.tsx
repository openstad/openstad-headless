import React, { FC, useState } from 'react';
import { FormProps, FieldProps } from "./props";
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

const Form: FC<FormProps> = ({
     title = 'Form Widget',
     fields = [],
     submitText = 'Verzenden',
     submitHandler = () => {},
     saveAsConceptLabel = '',
     saveAsConceptHandler = () => {},
 }) => {
    const initialFormValues: { [key: string]: any } = {};
    fields.forEach((field) => {
        if (field.fieldKey) {
            initialFormValues[field.fieldKey] = typeof field.defaultValue !== 'undefined' ? field.defaultValue :'';
        }
    });

    const [formValues, setFormValues] = useState(initialFormValues);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});

    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleSubmit(fields, formValues, setFormErrors, submitHandler);
    };

    const handleInputChange = (event) => {
        const { name, value } = event;
        setFormValues({ ...formValues, [name]: value });
    };

    const componentMap: { [key: string]: React.ComponentType<FieldProps> } = {
        text: TextInput,
        range: RangeSlider,
        checkbox: CheckboxField,
        radiobox: RadioboxField,
        select: SelectField,
        'tickmark-slider': TickmarkSlider,
        upload: FileUploadField,
        map: MapField,
        hidden: HiddenInput,
    };

    const renderField = (field: FieldProps, index: number) => {
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
                    {fields.map((field: FieldProps, index: number) => (
                        <div key={index}>
                            {renderField(field, index)}
                            <div className="error-message">
                                {formErrors[field.fieldKey] && <span>{formErrors[field.fieldKey]}</span>}
                            </div>
                        </div>
                    ))}
                    {saveAsConceptLabel && (
                        <button type="button" onClick={() => saveAsConceptHandler(formValues)}>{saveAsConceptLabel}</button>
                    )}
                    <button type="submit">{submitText}</button>
                </form>
            </div>
        </div>
    );
};

export default Form;
