import {FieldProps} from "@openstad-headless/form/src/props.js";
import React from "react";

const getMinMaxByField = (key, data) => {
    return !!data && typeof data.resources !== 'undefined' && typeof data.resources[key] !== 'undefined' ? data.resources[key] : '';
}

export const InitializeFormFields = (items, data) => {
    const formFields: FieldProps[] = [];

    if (typeof (items) === 'object' && items.length > 0
    ) {
        for (const item of items) {
            const itemType = item.type === 'a-b-slider' ? 'range' : item.type;
            const defaultValue = item.type === 'a-b-slider' ? '50' : '';

            const fieldData: any = {
                type: item.fieldType || itemType,
                title: item.title,
                description: item.description,
                fieldKey: `${item.type}-${item.trigger}`,
                fieldRequired: item.fieldRequired,
                minCharacters: getMinMaxByField(`${item.fieldKey}MinLength`, data) || item.minCharacters || '',
                maxCharacters: getMinMaxByField(`${item.fieldKey}MaxLength`, data) || item.maxCharacters || '',
                variant: item.variant,
                multiple: item.multiple,
                options: item.options,
                defaultValue: defaultValue,
                rows: 5,
                showMoreInfo: item.showMoreInfo || false,
                moreInfoButton: item.moreInfoButton || '',
                moreInfoContent: item.moreInfoContent || '',
                infoImage: item.infoImage || '',
                titleA: item.labelA || '',
                titleB: item.labelB || '',
                descriptionA: item.sliderTitleUnderA || '',
                descriptionB: item.sliderTitleUnderB || '',
                labelA: item.explanationA || '',
                labelB: item.explanationB || '',
                imageA: item.imageA || '',
                imageB: item.imageB || '',
                showLabels: false
            };

            switch (item.type) {
                case 'checkbox':
                case 'select':
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
                case 'imageUpload':
                    fieldData['allowedTypes'] = item.allowedTypes || ["image/*"];
                    break;
            }

            formFields.push(fieldData);
        }
    }

    return formFields;
}