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

            const embeddedUrl = window.location.href;

            const cleanUrlFromEndingQuestionMarks = (url: string) => {
                const length = url.length;
                let returnUrl = url;

                if (url.charAt(length - 1) === '?' || url.charAt(length - 1) === '&') {
                    returnUrl = url.slice(0, length - 1);
                }

                return returnUrl;
            }

            formData.embeddedUrl = cleanUrlFromEndingQuestionMarks(embeddedUrl);

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
                routingInitiallyHide: item.routingInitiallyHide || false,
                routingSelectedQuestion: item.routingSelectedQuestion || '',
                routingSelectedAnswer: item.routingSelectedAnswer || '',
                trigger: item.trigger || '',
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
                                defaultValue: option.titles[0].defaultValue,
                                trigger: option.trigger || ''
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
                    fieldData['infoField'] = item.infoField || '';

                    if (item.options && item.options.length > 0) {
                        fieldData['choices'] = item.options.map((option) => {
                            console.log('option', item.infoField);
                            return {
                                value: option.titles[0].key,
                                label: option.titles[0].key,
                                imageSrc: option.titles[0].image,
                                imageAlt: option.titles[0].key,
                                hideLabel: option.titles[0].hideLabel,
                                trigger: option.trigger || '',
                                description: option.titles[0].description || '',
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
                case 'documentUpload':
                    fieldData['type'] = 'documentUpload';
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
                    fieldData['prevPageText'] = item?.prevPageText || '1';
                    fieldData['nextPageText'] = item?.nextPageText || '2';
                    break;
                case 'none':
                    fieldData['type'] = 'none';
                    fieldData['image'] = item?.image || '';
                    fieldData['imageAlt'] = item?.imageAlt || '';
                    fieldData['imageDescription'] = item?.imageDescription || '';
                    fieldData['infoBlockStyle'] = item?.infoBlockStyle || 'default';
                    fieldData['infoBlockShareButton'] = item?.infoBlockShareButton || false;
                    fieldData['infoBlockExtraButton'] = item?.infoBlockExtraButton || '';
                    break;
                case 'swipe':
                    fieldData['type'] = 'swipe';
                    fieldData['cards'] = item?.options?.map((card) => {
                        return {
                            id: card.trigger,
                            title: card.titles[0].key,
                            infoField: card.titles[0].infoField,
                            image: card.titles[0].image || '',
                        };
                    });
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
    const totalFieldCount = props.items?.filter(item => item.questionType !== 'pagination').length || 0;

    const defaultAnswers = formFields.reduce((acc, item) => {
        if (typeof item.fieldKey !== 'undefined') {
            acc[item.fieldKey] = typeof item.defaultValue !== 'undefined' ? item.defaultValue : '';
        }
        return acc;
    }, {} as { [key: string]: FormValue });

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

    const getPrevPageTitle = formFields.filter(field => field.type === 'pagination')[currentPage]?.prevPageText || 'Vorige';
    const getNextPageTitle = formFields.filter(field => field.type === 'pagination')[currentPage]?.nextPageText || 'Volgende';

    const [isFullscreen, setIsFullscreen] = useState(false);
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isFullscreen]);

    return (
        <div className={`osc${isFullscreen ? ' --fullscreen' : ''}`}>
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
            {props.formStyle === 'youth' && (
                <div className="youth-form-actions">
                    <button
                        type="button"
                        className="youth-fullscreen-btn"
                        onClick={() => {
                            if (document.fullscreenElement) {
                                setIsFullscreen(false);
                                document.exitFullscreen();
                            } else {
                                setIsFullscreen(true);
                                document.documentElement.requestFullscreen();
                            }
                        }}
                    >
                        {isFullscreen ? <i className="ri-fullscreen-exit-line"></i> : <i className="ri-fullscreen-line"></i>}
                        <span>{isFullscreen ? 'Verlaat volledig scherm' : 'Bekijk in volledig scherm'}</span>
                    </button>
                </div>
            )}

            <div className={`osc-enquete-item-content --${props.formStyle}`}>
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
                    totalFieldCount={totalFieldCount}
                    formStyle={props.formStyle || 'default'}
                    {...props}
                />
            </div>

            <NotificationProvider />
        </div>
    );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
