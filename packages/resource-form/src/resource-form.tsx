import React, { useEffect, useState } from 'react';
import hasRole from '../../lib/has-role';
import type { ResourceFormWidgetProps } from "./props.js";
import { Banner, Button, Spacer } from "@openstad-headless/ui/src/index.js";
import { InitializeFormFields } from "./parts/init-fields.js";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import Form from "@openstad-headless/form/src/form";
import { Heading } from '@utrecht/component-library-react';
import NotificationService from '@openstad-headless/lib/NotificationProvider/notification-service';
import NotificationProvider from "@openstad-headless/lib/NotificationProvider/notification-provider";
import { getResourceId } from '@openstad-headless/lib/get-resource-id';

const getExistingValue = (fieldKey, resource) => {
    if (!!resource) {
        const field = resource[fieldKey] || null;
        const returnField = (!field && resource.extraData) ? resource.extraData[fieldKey] || null : field

        if (!!returnField) {
            return returnField;
        }

        if (fieldKey.startsWith('tags[') && resource.tags) {
            const tagType = fieldKey.substring(5, fieldKey.length - 1);

            return resource.tags
                ?.filter((tag) => tag.type === tagType)
                .map((tag) => tag.id);
        }
    }
    return undefined;
}

function ResourceFormWidget(props: ResourceFormWidgetProps) {
    const { submitButton, saveConceptButton, defaultAddedTags } = props.submit || {}; //TODO add saveButton variable. Unused variables cause errors in the admin
    const { loginText, loginButtonText } = props.info || {}; //TODO add nameInHeader variable. Unused variables cause errors in the admin
    const { confirmationUser, confirmationAdmin } = props.confirmation || {};
    const [disableSubmit, setDisableSubmit] = useState(false);

    let resourceId: string | undefined = String(getResourceId({
        url: document.location.href
    }));

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

    const { data: existingResource, isLoading, canEdit } = datastore.useResource({
        projectId: props.projectId,
        resourceId: resourceId || undefined
    });

    const initialFormFields = InitializeFormFields(props.items, props);
    type FormField = { fieldKey?: string; [key: string]: any };
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [fillDefaults, setFillDefaults] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (canEdit) {
            const updatedFormFields = initialFormFields.map((field) => {
                const existingValue = getExistingValue(field.fieldKey, existingResource);

                return existingValue ? { ...field, defaultValue: existingValue } : field;
            });

            setFormFields(updatedFormFields);
        } else if (JSON.stringify(formFields) !== JSON.stringify(initialFormFields)) {
            setFormFields(initialFormFields);
        }

        setFillDefaults(true);
    }, [JSON.stringify(existingResource), JSON.stringify(initialFormFields), isLoading]);

    const notifySuccess = () => NotificationService.addNotification("Inzending indienen gelukt", "success");
    const notifySuccessEdit = () => NotificationService.addNotification("Inzending bewerken gelukt", "success");
    const notifyFailed = () => NotificationService.addNotification("Inzending indienen mislukt", "error");
    const notifyFailedEdit = (message: string) => NotificationService.addNotification(message, "error");

    const addTagsToFormData = (formData) => {
        const tags = [];

        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                if (key.startsWith('tags[')) {
                    try {
                        if (!formData[key]) {
                            continue;
                        }

                        const tagsArray = JSON.parse(formData[key]);

                        if (typeof tagsArray === 'object') {
                            tagsArray?.map((value) => {
                                const pushValue = typeof (value) === 'string' ? Number(value) : value;
                                tags.push(pushValue);
                            });
                        } else if (typeof tagsArray === 'string' || typeof tagsArray === 'number') {
                            const pushValue = typeof (tagsArray) === 'string' ? Number(tagsArray) : tagsArray;
                            tags.push(pushValue);
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
        let configuredFormData = {...formData };

        configuredFormData = addTagsToFormData(configuredFormData);

        for (const key in configuredFormData) {
            if (configuredFormData.hasOwnProperty(key)) {
                if (!dbFixedColumns.includes(key)) {
                    extraData[key] = configuredFormData[key];
                    delete configuredFormData[key];
                }
            }
        }

        configuredFormData.extraData = extraData;
        configuredFormData.publishDate = publish ? new Date() : '';
        configuredFormData.confirmationUser = confirmationUser;
        configuredFormData.confirmationAdmin = confirmationAdmin;

        return configuredFormData;
    }

    const redirectAfterSaveOrCreate = (resource: { id?: string }, reloadPageAsFallback = false) => {
        if (props.redirectUrl && resource.id) {
            let redirectUrl = props.redirectUrl.replace("[id]", resource.id);
            if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                redirectUrl = document.location.origin + '/' + (redirectUrl.startsWith('/') ? redirectUrl.substring(1) : redirectUrl);
            }
            document.location.href = redirectUrl.replace("[id]", resource.id);
        } else if (reloadPageAsFallback) {
            window.location.reload();
        }
    }

    const editMode = canEdit && existingResource && existingResource.id && existingResource.update;
    const submitButtonText = editMode
        ? "Opslaan"
        : submitButton || "Versturen";

    async function onSubmit(formData: any) {
        setDisableSubmit(true);

        const finalFormData = configureFormData(formData, true);

        try {
            if (editMode) {
                try {
                    await existingResource.update(finalFormData);
                    notifySuccessEdit();
                    redirectAfterSaveOrCreate(existingResource, true);
                } catch (e) {
                    notifyFailedEdit(e.message || 'Inzending bewerken mislukt');
                } finally {
                    setDisableSubmit(false);
                }

                return;
            }

            const result = await createResource(finalFormData, props.widgetId);
            if (result) {
                notifySuccess();
                redirectAfterSaveOrCreate(result);
            }
            setDisableSubmit(false);
        } catch (e) {
            notifyFailed();
            setDisableSubmit(false);
        }
    }

    useEffect(() => {
        const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        const url = new URL(window.location.href);

        if (Array.isArray(formFields) && hasRole(currentUser, 'member')) {
            formFields.forEach(field => {
                if (field && field.fieldKey && params.hasOwnProperty(field.fieldKey)) {
                    url.searchParams.delete(field.fieldKey);
                }
            });
        }
       
        window.history.replaceState(null, '', url.toString());
    }, [formFields]);


    return (isLoading || !fillDefaults) ? null : (
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
                        submitText={submitButtonText}
                        title=""
                        submitDisabled={disableSubmit}
                        allowResetAfterSubmit={editMode}
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
