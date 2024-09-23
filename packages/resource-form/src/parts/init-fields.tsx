import {FieldProps} from "@openstad-headless/form/src/props.js";
import React from "react";
import DataStore from "@openstad-headless/data-store/src";

const getMinMaxByField = (key, data) => {
    return !!data && typeof data.resources !== 'undefined' && typeof data.resources[key] !== 'undefined' ? data.resources[key] : '';
}

export const InitializeFormFields = (items, data) => {
    const formFields: FieldProps[] = [];
    if (typeof (items) === 'object' && items.length > 0
    ) {
        const datastore = new DataStore({
            projectId: data.projectId,
            api: data.api,
            config: { api: data.api },
        });
        for (const item of items) {

            if ( item.type === 'tags' ) {

                const { data: tags } = datastore.useTags({
                    projectId: data.projectId,
                    type: item.tags,
                });

                item.options = !!tags ?
                    tags
                        .filter((tag: any) => tag.type === item.tags)
                        .map((tag: any, index: number) => ({
                            trigger: `${index}`,
                            titles: [{text: tag.name, key: tag.id}],
                            images: []
                        }))
                    : [];
            }

            const fieldData: any = {
                type: item.fieldType || item.type,
                title: item.title,
                description: item.description,
                fieldKey: item.fieldKey,
                fieldRequired: item.fieldRequired,
                minCharacters: getMinMaxByField(`${item.fieldKey}MinLength`, data) || item.minCharacters || '',
                maxCharacters: getMinMaxByField(`${item.fieldKey}MaxLength`, data) || item.maxCharacters || '',
                variant: item.variant,
                multiple: item.multiple,
                options: item.options,
                rows: 5,
                placeholder: item.placeholder
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
                            return { value: option.titles[0].key, label: option.titles[0].key, isOtherOption: option.titles[0].isOtherOption}
                        });
                    }
                    break;
                case 'imageUpload':
                    fieldData['allowedTypes'] = item.allowedTypes || ["image/*"];
                    break;
                case 'tags':
                    if (
                        item.options &&
                        item.options.length > 0
                    ) {
                        fieldData['choices'] = item.options.map((option) => {
                            return { value: (option.titles[0].key).toString(), label: option.titles[0].text }
                        });
                    }
                    break;
                
            }

            formFields.push(fieldData);
        }
    }

    return formFields;
}
