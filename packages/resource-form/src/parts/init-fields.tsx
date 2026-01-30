import { FieldProps } from "@openstad-headless/form/src/props.js";
import React, { useEffect } from "react";
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

            if (item.type === 'tags') {

                const { data: tags } = datastore.useTags({
                    projectId: data.projectId,
                    type: item.tags,
                });

                item.options = !!tags ?
                    tags
                        .filter((tag: any) => tag.type === item.tags)
                        .map((tag: any, index: number) => ({
                            trigger: `${index}`,
                            titles: [{ text: tag.name, key: tag.id }],
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
                placeholder: item.placeholder,
                maxCharactersWarning: data?.general?.maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over',
                maxCharactersOverWarning: data?.general?.maxCharactersOverWarning || 'Je hebt {overCharacters} tekens teveel',
                minCharactersWarning: data?.general?.minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
                minCharactersError: data?.general?.minCharactersError || 'Tekst moet minimaal {minCharacters} karakters bevatten',
                maxCharactersError: data?.general?.maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten',
                showMinMaxAfterBlur: data?.general?.showMinMaxAfterBlur || false,
                routingInitiallyHide: item?.routingInitiallyHide || false,
                routingSelectedQuestion: item?.routingSelectedQuestion || '',
                routingSelectedAnswer: item?.routingSelectedAnswer || '',
                trigger: item.trigger || '',
                selectAll: item?.selectAll || false,
                selectAllLabel: item?.selectAllLabel || '',
            };

            if (item.defaultValue) {
                fieldData['defaultValue'] = item.defaultValue;
            }

            const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
            if (params && params[item.fieldKey]) {
                fieldData['defaultValue'] = params[item.fieldKey];
            }



            switch (item.type) {
                case 'checkbox':
                case 'select':
                case 'radiobox':
                    if (
                        item.options &&
                        item.options.length > 0
                    ) {
                        const defaultValue: string[] = [];

                        fieldData['choices'] = item.options.map((option) => {
                            if (option.titles[0].defaultValue) {
                                defaultValue.push(option.titles[0].key);
                            }
                            return {
                                value: option.titles[0].key,
                                label: option.titles[0].key,
                                isOtherOption: option.titles[0].isOtherOption,
                                defaultValue: option.titles[0].defaultValue,
                                trigger: option.trigger || ''
                            }
                        });

                        if (defaultValue.length > 0) {
                            fieldData['defaultValue'] = defaultValue;
                        }
                    }
                    if (item.maxChoices) {
                        fieldData['maxChoices'] = item.maxChoices;
                    }
                    if (item.maxChoicesMessage) {
                        fieldData['maxChoicesMessage'] = item.maxChoicesMessage;
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
                            return {
                                value: (option.titles[0].key).toString(),
                                label: option.titles[0].text,
                                trigger: option.trigger || ''
                            }
                        });
                    }
                    break;
                case 'budget':
                    fieldData['format'] = true;
                    break;
                case 'map':
                case 'location':
                    if (!!data?.datalayer) {
                        fieldData['datalayer'] = data?.datalayer;
                    }

                    if (typeof (data?.enableOnOffSwitching) === 'boolean') {
                        fieldData['enableOnOffSwitching'] = data?.enableOnOffSwitching;
                    }
                    break;
                case 'matrix':
                    fieldData['type'] = 'matrix';
                    fieldData['matrix'] = item?.matrix || undefined;
                    fieldData['matrixMultiple'] = item?.matrixMultiple || false;
                    fieldData['defaultValue'] = [];
                    break;
            }

            formFields.push(fieldData);
        }
    }


    return formFields;
}
