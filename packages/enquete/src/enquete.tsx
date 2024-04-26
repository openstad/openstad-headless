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

    async function onSubmit(formData: any) {
        const result = await createSubmission(formData, props.widgetId);

        if (result) {
            if(props.afterSubmitUrl) {
                location.href = props.afterSubmitUrl.replace("[id]", result.id)
            } else {
                notifyCreate();
            }
        }
    }

    const formOnlyVisibleForUsers = (
        (!!props.formVisibility && props.formVisibility === 'users')
        || !props.formVisibility
    );

    const formFields : FieldProps[] = [];
    if ( typeof(props) !== 'undefined'
        && typeof(props.items) === 'object'
        && props.items.length > 0
    ) {
        for (const item of props.items) {
            const fieldData : any = {
                title: item.title,
                description: item.description,
                fieldKey: item.fieldKey,
                disabled: !hasRole(currentUser, 'member') && formOnlyVisibleForUsers,
            };

            switch (item.questionType) {
                case 'open':
                    fieldData['type'] = 'text';
                    fieldData['variant'] = item.variant;
                    fieldData['minCharacters'] = item.minCharacters || '';
                    fieldData['maxCharacters'] = item.maxCharacters || '';
                    fieldData['rows'] = 5;
                    break;
                case 'multiplechoice':
                case 'multiple':
                    fieldData['type'] = item.questionType === 'multiplechoice' ? 'radiobox' : 'checkbox';

                    if (
                        item.options &&
                        item.options.length > 0
                    ) {
                        fieldData['choices'] = item.options.map((option) => {
                            return option.titles[0].key
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
                case 'scale':
                    fieldData['type'] = 'tickmark-slider';
                    fieldData['fieldOptions'] = [
                        { value: 'Sad', label: <Icon icon="ri-emotion-sad-line" /> },
                        { value: 'Unhappy', label: <Icon icon="ri-emotion-unhappy-line" /> },
                        { value: 'Normal', label: <Icon icon="ri-emotion-normal-line" /> },
                        { value: 'Happy', label: <Icon icon="ri-emotion-happy-line" /> },
                        { value: 'Laugh', label: <Icon icon="ri-emotion-laugh-line" /> },
                    ];
                    break;
                case 'none':
                    fieldData['type'] = 'none';
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
                />
            </div>

            <Toaster />
        </div>
    );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
