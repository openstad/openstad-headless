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
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Form from "@openstad-headless/form/src/form";
import { FieldProps } from '@openstad-headless/form/src/props';
import {
    Paragraph,
    Heading2,
    Heading6,
} from '@utrecht/component-library-react';
export type EnqueteWidgetProps = BaseProps &
    ProjectSettingProps &
    EnquetePropsType;

function Enquete(props: EnqueteWidgetProps) {
    const notifyCreate = () =>
        toast.success('Enquete ingediend', { position: 'bottom-center' });

    const datastore = new DataStore(props);

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

        const result = await createSubmission(formData, props.widgetId);

        if (result) {
            if (props.afterSubmitUrl) {
                location.href = props.afterSubmitUrl.replace("[id]", result.id)
            } else {
                notifyCreate();
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
                    break;
                case 'multiplechoice':
                case 'multiple':
                    fieldData['type'] = item.questionType === 'multiplechoice' ? 'radiobox' : 'checkbox';

                    if (
                        item.options &&
                        item.options.length > 0
                    ) {
                        fieldData['choices'] = item.options.map((option) => {
                            return {
                                value: option.titles[0].key,
                                label: option.titles[0].key,
                                isOtherOption: option.titles[0].isOtherOption
                            };
                        });
                    }
                    break;
                case 'images':
                    fieldData['type'] = 'imageChoice';
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
                    fields={formFields}
                    submitHandler={onSubmit}
                    title=""
                    submitText="Versturen"
                    submitDisabled={!hasRole(currentUser, 'member') && formOnlyVisibleForUsers}
                    {...props}
                />
            </div>

            <Toaster />
        </div>
    );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
