import { ZodType } from "zod";
import {getSchemaForField} from "./validation.js";
import {CombinedFieldPropsWithType} from "./props";
import {Dispatch, SetStateAction} from "react";

export const handleSubmit = (fields: CombinedFieldPropsWithType[], formValues: {[key: string]: string}, setFormErrors: Dispatch<SetStateAction<{ [key: string]: string | null; }>>, submitHandler: (values: {[key: string]: string}) => void) => {
    const errors: { [key: string]: string | null } = {};
    fields.forEach((field) => {
        if (field.fieldKey) {
            const fieldValue = formValues[field.fieldKey];
            const fieldSchema: ZodType<any> | undefined = getSchemaForField(field);

            if (fieldSchema) {
                try {
                    fieldSchema.parse(fieldValue);
                } catch (error) {
                    let errorMessage = null;

                    if (typeof error === 'object' && error !== null && 'message' in error) {
                        if (typeof error.message === 'string') {
                            const parsedErrors = JSON.parse(error.message);
                            if (Array.isArray(parsedErrors) && parsedErrors.length > 0) {
                                const firstError = parsedErrors[0];
                                errorMessage = firstError.message;
                            }
                        }
                    }

                    errors[field.fieldKey] = errorMessage;
                }
            }
        }
    });

    setFormErrors(errors);

    if (Object.values(errors).every((error) => error === null)) {
        submitHandler(formValues);
    }
};
