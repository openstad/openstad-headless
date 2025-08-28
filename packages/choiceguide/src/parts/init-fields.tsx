import {FieldProps} from "@openstad-headless/form/src/props.js";
import React from "react";

const getMinMaxByField = (key, data) => {
    return !!data && typeof data.resources !== 'undefined' && typeof data.resources[key] !== 'undefined' ? data.resources[key] : '';
}

export const InitializeFormFields = (items, data, showForm = true) => {
    const formFields: FieldProps[] = [];

    if (typeof (items) === 'object' && items.length > 0
    ) {
        for (const item of items) {
            const itemType = item.type === 'a-b-slider' ? 'range' : item.type;

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
                defaultValue: '',
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
                showLabels: false,
                disabled: !showForm,
                maxCharactersWarning: data?.choiceGuide?.maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over',
                minCharactersWarning: data?.choiceGuide?.minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
                minCharactersError: data?.choiceGuide?.minCharactersError|| 'Tekst moet minimaal {minCharacters} karakters bevatten',
                maxCharactersError: data?.choiceGuide?.maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten',
            };

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
                                defaultValue: option.titles[0].defaultValue
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
                case 'text':
                    if ( item.defaultValue ) {
                        fieldData['defaultValue'] = item.defaultValue;
                    }
                    break;
                case 'a-b-slider':
                    fieldData['skipQuestion'] = item.skipQuestion || false;
                    fieldData['skipQuestionAllowExplanation'] = item.skipQuestionAllowExplanation || false;
                    fieldData['skipQuestionExplanation'] = item.skipQuestionExplanation || '';
                    fieldData['skipQuestionLabel'] = item.skipQuestionLabel || '';
                    fieldData['defaultValue'] = {
                        value: '50',
                        skipQuestion: false,
                        skipQuestionExplanation: ''
                    }
                    break;
                case 'map':
                    if ( !!data?.datalayer ) {
                        fieldData['datalayer'] = data?.datalayer;
                    }

                    if ( typeof(data?.enableOnOffSwitching) === 'boolean' ) {
                        fieldData['enableOnOffSwitching'] = data?.enableOnOffSwitching;
                    }
            }

            formFields.push(fieldData);
        }
    }

    return formFields;
}