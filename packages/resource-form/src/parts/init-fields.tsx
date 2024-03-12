import {FieldProps} from "@openstad-headless/form/src/props.js";
import {Icon} from "@openstad-headless/ui/src/index.js";

const getMinMaxByField = (key, data) => {
    return !!data && typeof data.resources !== 'undefined' && typeof data.resources[key] !== 'undefined' ? data.resources[key] : '';
}

export const InitializeFormFields = (items, data) => {
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
                minCharacters: getMinMaxByField(`${item.fieldKey}MinLength`, data) || item.minCharacters || '',
                maxCharacters: getMinMaxByField(`${item.fieldKey}MaxLength`, data) || item.maxCharacters || '',
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