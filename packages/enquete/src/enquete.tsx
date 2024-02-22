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
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Form from "../../form/src/form.tsx";

export type EnqueteWidgetProps = BaseProps &
    ProjectSettingProps &
    EnquetePropsType;

function Enquete(props: EnqueteWidgetProps) {
    const notifyCreate = () =>
        toast.success('Enquete ingedient', { position: 'bottom-center' });

    const datastore = new DataStore(props);

    const [currentUser, currentUserError, currentUserIsLoading] =
        datastore.useCurrentUser({ ...props });

    const { data, create: createSubmission } = datastore.useSubmissions({
        projectId: props.projectId,
    });

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

    const formFields = [];
    if ( typeof(props) !== 'undefined'
        && typeof(props.items) === 'object'
        && props.items.length > 0
    ) {
        for (const item of props.items) {
            const fieldData = {
                type: item.questionType,
                title: item.title,
                description: item.description,
                fieldKey: item.key,
                disabled: hasRole(currentUser, 'member') ? false : true,
            };

            switch (item.questionType) {
                case 'open':
                    fieldData['type'] = 'text';
                    fieldData['variant'] = 'textarea';
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

                    if (item.options &&
                    item.options?.length > 0 &&
                    item.options[0].titles &&
                    item.options[0].titles.length > 0) {
                        fieldData['choices'] = item.options[0].titles.map((option, index) => {
                            return {
                                label: option.text,
                                value: option.key,
                                imageSrc: item.options?.at(0)?.images?.at(index)?.src || '',
                            };
                        });
                    }
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
            }

            formFields.push(fieldData);
        }
    }

    return (
        <div className="osc">
            {!hasRole(currentUser, 'member') && (
                <>
                    <Banner className="big">
                        <h6>Inloggen om deel te nemen.</h6>
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
                {props.displayTitle && props.title && <h4>{props.title}</h4>}
                <div className="osc-enquete-item-description">
                    {props.displayDescription && props.description && (
                        <p>{props.description}</p>
                    )}
                </div>
                <Form
                    fields={formFields}
                    submitHandler={onSubmit}
                    title=""
                    submitText="Versturen"
                    submitDisabled={hasRole(currentUser, 'member') ? false : true}
                />
            </div>

            <Toaster />
        </div>
    );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
