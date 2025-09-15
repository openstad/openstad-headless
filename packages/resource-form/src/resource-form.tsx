import React, { useState } from 'react';
import hasRole from '../../lib/has-role';
import type {ResourceFormWidgetProps} from "./props.js";
import {Banner, Button, Spacer} from "@openstad-headless/ui/src/index.js";
import {InitializeFormFields} from "./parts/init-fields.js";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import Form from "@openstad-headless/form/src/form";
import { Heading } from '@utrecht/component-library-react';
import NotificationService from '@openstad-headless/lib/NotificationProvider/notification-service';
import NotificationProvider from "@openstad-headless/lib/NotificationProvider/notification-provider";

function ResourceFormWidget(props: ResourceFormWidgetProps) {
    const { submitButton, saveConceptButton, defaultAddedTags} = props.submit  || {}; //TODO add saveButton variable. Unused variables cause errors in the admin
    const { loginText, loginButtonText} = props.info  || {}; //TODO add nameInHeader variable. Unused variables cause errors in the admin
    const { confirmationUser, confirmationAdmin} = props.confirmation  || {};
    const [disableSubmit, setDisableSubmit] = useState(false);

    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const {
        data: currentUser,
        error: currentUserError,
        isLoading: currentUserIsLoading,
    } = datastore.useCurrentUser({ ...props });

    const { create: createResource } = datastore.useResources({
        projectId: props.projectId,
        widgetId: props.widgetId,
    });

    const formFields = InitializeFormFields(props.items, props);

    const notifySuccess = () => NotificationService.addNotification("Idee indienen gelukt", "success");
    const notifyFailed = () => NotificationService.addNotification("Idee indienen mislukt", "error");

    const addTagsToFormData = (formData) => {
        const tags = [];

        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                if (key.startsWith('tags[')) {
                    try {
                        const tagsArray = JSON.parse(formData[key]);

                        if (typeof tagsArray === 'object') {
                            tagsArray?.map((value) => {
                                tags.push(value);
                            });
                        } else if (typeof tagsArray === 'string' || typeof tagsArray === 'number') {
                            tags.push(tagsArray);
                        }
                    } catch (error) {
                        console.error(`Error parsing tags for key ${key}:`, error);
                    } finally {
                        delete formData[key];
                    }
                }
            }
        }

        if (defaultAddedTags) {
            const defaultTagsArray = defaultAddedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

            defaultTagsArray.forEach(tag => {
                const tagNumber = Number(tag);

                if (!isNaN(tagNumber) && !tags.includes(tagNumber)) {
                    tags.push(tagNumber);
                }
            });
        }

        formData.tags = tags;

        return formData;
    };

    const configureFormData = (formData, publish = false) => {
        const dbFixedColumns = ['title', 'summary', 'description', 'budget', 'images', 'location', 'tags', 'documents'];
        const extraData = {};

        formData = addTagsToFormData(formData);

        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                if (!dbFixedColumns.includes(key)) {
                    extraData[key] = formData[key];
                    delete formData[key];
                }
            }
        }

        formData.extraData = extraData;
        formData.publishDate = publish ? new Date() : '';
        formData.confirmationUser = confirmationUser;
        formData.confirmationAdmin = confirmationAdmin;

        return formData;
    }

    async function onSubmit(formData: any) {
        setDisableSubmit(true);

        const finalFormData = configureFormData(formData, true);

        try {
            const result = await createResource(finalFormData, props.widgetId);
            if (result) {
                notifySuccess();

                if(props.redirectUrl) {
                    let redirectUrl = props.redirectUrl.replace("[id]", result.id);
                    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                        redirectUrl = document.location.origin + '/' + (redirectUrl.startsWith('/') ? redirectUrl.substring(1) : redirectUrl);
                    }
                    document.location.href = redirectUrl.replace("[id]", result.id);
                } else {
                    setDisableSubmit(false);
                }
            }
        } catch (e) {
            notifyFailed();
            setDisableSubmit(false);
        }
    }


    return (
        <div className="osc">
            <div className="osc-resource-form-item-content">
                {props.displayTitle && props.title ? <h4>{props.title}</h4> : null}
                <div className="osc-resource-form-item-description">
                    {props.displayDescription && props.description ? <p>{props.description}</p> : null}
                </div>

                {!hasRole(currentUser, 'member') ? (
                    <>
                        <Banner className="big">
                            <Heading level={4} appearance='utrecht-heading-6'>{loginText || 'Inloggen om deel te nemen.'}</Heading>
                            <Spacer size={1} />
                            <Button
                                type="button"
                                onClick={() => {
                                    document.location.href = props.login?.url || '';
                                }}>
                                {loginButtonText || 'Inloggen'}
                            </Button>
                        </Banner>
                        <Spacer size={2} />
                    </>
                ) : (
                    <Form
                        fields={formFields}
                        secondaryLabel={saveConceptButton || ""}
                        submitHandler={onSubmit}
                        submitText={submitButton || "Versturen"}
                        title=""
                        submitDisabled={disableSubmit}
                        {...props}
                    />
                )}
                <NotificationProvider />
            </div>
        </div>
    );
}

ResourceFormWidget.loadWidget = loadWidget;
export { ResourceFormWidget };
