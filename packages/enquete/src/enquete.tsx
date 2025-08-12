import './enquete.css';
import { EnquetePropsType } from './types/';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
    Banner,
    Button, Icon,
    Spacer,
} from '@openstad-headless/ui/src';
import hasRole from '../../lib/has-role';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';
import React, { useState, useEffect } from 'react';
import Form from "@openstad-headless/form/src/form";
import { FieldProps } from '@openstad-headless/form/src/props';
import {
    Paragraph,
    Heading2,
    Heading6,
} from '@utrecht/component-library-react';
import NotificationService from "../../lib/NotificationProvider/notification-service";
import NotificationProvider from "../../lib/NotificationProvider/notification-provider";
import { FormValue } from "@openstad-headless/form/src/form";

export type EnqueteWidgetProps = BaseProps &
    ProjectSettingProps &
    EnquetePropsType;

function Enquete(props: EnqueteWidgetProps) {
    const datastore = new DataStore(props);
    const notifyCreate = () => NotificationService.addNotification("Enquete ingediend", "success");


    const { create: createSubmission } = datastore.useSubmissions({
        projectId: props.projectId,
    });

    const {
        data: currentUser,
        error: currentUserError,
        isLoading: currentUserIsLoading,
    } = datastore.useCurrentUser({ ...props });

    const formOnlyVisibleForUsers = (
        (!!props.formVisibility && props.formVisibility === 'users')
        || !props.formVisibility
    );

    async function onSubmit(formData: any) {

        if (currentPage < totalPages - 1) {
            setCurrentPage((prevPage) => prevPage + 1);
        } else {

            formData.confirmationUser = props?.confirmation?.confirmationUser || false;
            formData.confirmationAdmin = props?.confirmation?.confirmationAdmin || false;
            formData.overwriteEmailAddress = (formData.confirmationAdmin && props?.confirmation?.overwriteEmailAddress) ? props?.confirmation?.overwriteEmailAddress : '';

            const getUserEmailFromField = formData.confirmationUser && !formOnlyVisibleForUsers;

            if (getUserEmailFromField) {
                const userEmailAddressFieldKey = props?.confirmation?.userEmailAddress || null;

                if (formData.hasOwnProperty(userEmailAddressFieldKey) && userEmailAddressFieldKey) {
                    formData.userEmailAddress = formData[userEmailAddressFieldKey] || '';
                }
            }

            formData.embeddedUrl = window.location.href;

            const result = await createSubmission(formData, props.widgetId);

            if (result) {
                if (props.afterSubmitUrl) {
                    location.href = props.afterSubmitUrl.replace("[id]", result.id)
                } else {
                    notifyCreate();
                }
            }
        }

    }


    const formFields: FieldProps[] = [];
    if (typeof (props) !== 'undefined'
        && typeof (props.items) === 'object'
        && props.items.length > 0
    ) {
        for (const item of props.items) {
            const fieldData: any = {
                title: item.title,
                description: item.description,
                fieldKey: item.fieldKey,
                disabled: !hasRole(currentUser, 'member') && formOnlyVisibleForUsers,
                fieldRequired: item.fieldRequired,
            };

            switch (item.questionType) {
                case 'open':
                    fieldData['type'] = 'text';
                    fieldData['variant'] = item.variant;
                    fieldData['minCharacters'] = item.minCharacters || '';
                    fieldData['maxCharacters'] = item.maxCharacters || '';
                    fieldData['rows'] = 5;
                    fieldData['placeholder'] = item.placeholder || '';
                    fieldData['defaultValue'] = item.defaultValue || '';
                    fieldData['maxCharactersWarning'] = props?.maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over';
                    fieldData['minCharactersWarning'] = props?.minCharactersWarning || 'Nog minimaal {minCharacters} tekens';
                    fieldData['maxCharactersError'] = props?.maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten';
                    fieldData['minCharactersError'] = props?.minCharactersError || 'Tekst moet minimaal {minCharacters} karakters bevatten';
                    break;
                case 'multiplechoice':
                case 'multiple':
                    fieldData['type'] = item.questionType === 'multiplechoice' ? 'radiobox' : 'checkbox';

                    const defaultValue: string[] = [];

                    if (
                        item.options &&
                        item.options.length > 0
                    ) {
                        fieldData['choices'] = item.options.map((option) => {
                            if (option.titles[0].defaultValue) {
                                defaultValue.push(option.titles[0].key);
                            }

                            return {
                                value: option.titles[0].key,
                                label: option.titles[0].key,
                                isOtherOption: option.titles[0].isOtherOption,
                                defaultValue: option.titles[0].defaultValue
                            };
                        });
                    }

                    if (defaultValue.length > 0) {
                        fieldData['defaultValue'] = defaultValue;
                    }

                    if (item.maxChoices) {
                        fieldData['maxChoices'] = item.maxChoices;
                    }
                    if (item.maxChoicesMessage) {
                        fieldData['maxChoicesMessage'] = item.maxChoicesMessage;
                    }

                    break;
                case 'images':
                    fieldData['type'] = 'imageChoice';
                    fieldData['multiple'] = item.multiple || false;

                    if (item.options && item.options.length > 0) {
                        fieldData['choices'] = item.options.map((option) => {
                            return {
                                value: option.titles[0].key,
                                label: option.titles[0].key,
                                imageSrc: option.titles[0].image,
                                imageAlt: option.titles[0].key,
                                hideLabel: option.titles[0].hideLabel
                            };
                        });
                    } else {
                        fieldData['choices'] = [
                            {
                                label: item?.text1 || '',
                                value: item?.key1 || '',
                                imageSrc: item?.image1 || ''
                            },
                            {
                                label: item?.text2 || '',
                                value: item?.key2 || '',
                                imageSrc: item?.image2 || ''
                            }
                        ];
                    }

                    break;
                case 'imageUpload':
                    fieldData['type'] = 'imageUpload';
                    fieldData['allowedTypes'] = ["image/*"];
                    fieldData['imageUrl'] = props?.imageUrl;
                    fieldData['multiple'] = item.multiple;
                    break;
                case 'scale':
                    fieldData['type'] = 'tickmark-slider';
                    fieldData['showSmileys'] = item.showSmileys;

                    const labelOptions = [
                        <Icon icon="ri-emotion-unhappy-line" key={1} />,
                        <Icon icon="ri-emotion-sad-line" key={2} />,
                        <Icon icon="ri-emotion-normal-line" key={3} />,
                        <Icon icon="ri-emotion-happy-line" key={4} />,
                        <Icon icon="ri-emotion-laugh-line" key={5} />
                    ]

                    fieldData['fieldOptions'] = labelOptions.map((label, index) => {
                        const currentValue = index + 1;
                        return {
                            value: currentValue,
                            label: item.showSmileys ? label : currentValue,
                        }
                    });
                    break;
                case 'map':
                    fieldData['type'] = 'map';

                    if (!!props?.datalayer) {
                        fieldData['datalayer'] = props?.datalayer;
                    }

                    if (typeof (props?.enableOnOffSwitching) === 'boolean') {
                        fieldData['enableOnOffSwitching'] = props?.enableOnOffSwitching;
                    }

                    break;
                case 'pagination':
                    fieldData['type'] = 'pagination';
                    fieldData['prevPageTekst'] = item?.prevPageTekst || '1';
                    fieldData['nextPageTekst'] = item?.nextPageTekst || '2';
                    console.log('Pagination field detected');
                    break;
                case 'none':
                    fieldData['type'] = 'none';
                    fieldData['image'] = item?.image || '';
                    fieldData['imageAlt'] = item?.imageAlt || '';
                    fieldData['imageDescription'] = item?.imageDescription || '';
                    break;
            }

            formFields.push(fieldData);
        }
    }

    const defaultAnswers = formFields.reduce((acc, item) => {
        // @ts-ignore
        acc[item.fieldKey] = item?.defaultValue;
        return acc;
    }, {});

    // @ts-ignore   
    const [answers, setAnswers] = useState<{ [key: string]: FormValue }>(defaultAnswers);
    const [completeAnswers, setCompleteAnswers] = useState<{ [key: string]: FormValue }>({});
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: string }>({});

    const totalPages = formFields.filter(field => field.type === 'pagination').length + 1 || 1;
    // Find indices of all pagination fields
    const paginationIndices = formFields
        .map((field, idx) => field.type === 'pagination' ? idx : -1)
        .filter(idx => idx !== -1);

    // Add start and end indices for slicing
    const pageStartIndices = [0, ...paginationIndices.map(idx => idx + 1)];
    const pageEndIndices = [...paginationIndices, formFields.length];

    // Get fields for the current page
    const currentFields = formFields.slice(pageStartIndices[currentPage], pageEndIndices[currentPage]);

    useEffect(() => {
        const updatedAnswers = { ...answers, ...currentAnswers };
        setAnswers(updatedAnswers);
    }, [currentAnswers]);

    console.log(currentPage, formFields.filter(field => field.type === 'pagination'), formFields.filter(field => field.type === 'pagination')[currentPage]);


    // @ts-ignore
    const getPrevPageTitle = formFields.filter(field => field.type === 'pagination')[currentPage]?.prevPageTekst || 'Vorige';
    // @ts-ignore
    const getNextPageTitle = formFields.filter(field => field.type === 'pagination')[currentPage]?.nextPageTekst || 'Volgende';

    return (
        <div className="osc">
            {
                (formOnlyVisibleForUsers && !hasRole(currentUser, 'member')) && (
                    <>
                        <Banner className="big">
                            <Heading6>Inloggen om deel te nemen.</Heading6>
                            <Spacer size={1} />
                            <Button
                                type="button"
                                onClick={() => {
                                    document.location.href = props.login?.url || '';
                                }}>
                                Inloggen
                            </Button>
                        </Banner>
                        <Spacer size={2} />
                    </>
                )}

            <div className="osc-enquete-item-content">
                {props.displayTitle && props.title && <Heading2>{props.title}</Heading2>}
                <div className="osc-enquete-item-description">
                    {props.displayDescription && props.description && (
                        <Paragraph>{props.description}</Paragraph>
                    )}
                </div>
                <Form
                    fields={currentFields}
                    submitHandler={onSubmit}
                    title=""
                    submitText={currentPage < totalPages - 1 ? getNextPageTitle : ("Versturen")}
                    submitDisabled={!hasRole(currentUser, 'member') && formOnlyVisibleForUsers}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    prevPage={currentPage > 0 ? currentPage - 1 : null}
                    prevPageText={getPrevPageTitle}
                    {...props}
                />
            </div>

            <NotificationProvider />
        </div>
    );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
