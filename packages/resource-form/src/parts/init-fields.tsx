import {FieldProps} from "@openstad-headless/form/src/props.js";
import {Icon} from "@openstad-headless/ui/src/index.js";

export const InitializeFormFields = (items) => {
    const formFields: FieldProps[] = [];
    if (typeof (items) === 'object' && items.length > 0
    ) {
        for (const item of items) {
            const fieldData: any = {
                type: item.type,
                title: item.title,
                description: item.description,
                fieldKey: item.fieldKey,
                fieldRequired: item.fieldRequired,
                minCharacters: item.minCharacters,
                maxCharacters: item.maxCharacters,
                variant: item.variant,
                multiple: item.multiple,
                options: item.options
            };

            switch (item.type) {
                case 'text':
                    fieldData['rows'] = 4;
                    break;
                case 'checkbox':
                case 'radiobox':
                    if (
                        item.options &&
                        item.options.length > 0
                    ) {
                        fieldData['choices'] = item.options.map((option) => {
                            return option.titles[0].key
                        });
                    }
                    break;
            }

            formFields.push(fieldData);
        }
    }

    return formFields;
}