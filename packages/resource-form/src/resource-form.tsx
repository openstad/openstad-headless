import React from 'react';
import hasRole from '../../lib/has-role';
import {ResourceFormWidgetProps} from "./props.js";
import {Banner, Button, Spacer} from "@openstad-headless/ui/src/index.js";
import {InitializeFormFields} from "./parts/init-fields.js";
import toast, { Toaster } from 'react-hot-toast';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import Form from "@openstad-headless/form/src/form";

function ResourceFormWidget(props: ResourceFormWidgetProps) {
    const { submitButton, saveConceptButton} = props.submit  || {}; //TODO add saveButton variable. Unused variables cause errors in the admin
    const { loginText, loginButtonText} = props.info  || {}; //TODO add nameInHeader variable. Unused variables cause errors in the admin
    const { confirmationUser, confirmationAdmin} = props.confirmation  || {};

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
    });

    const formFields = InitializeFormFields(props.items, props);

    const notifySuccess = () =>
        toast.success('Idee indienen gelukt', { position: 'bottom-center' });

    const notifyFailed = () =>
        toast.error('Idee indienen mislukt', { position: 'bottom-center' });

    const addTagsToFormData = (formData) => {
        const tags = [];

        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                if (key.startsWith('tags[')) {
                    tags.push(formData[key]);
                    delete formData[key];
                }
            }
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
        // TODO: Redirect user to afterSubmitUrl when set
        // const result = await createResource(formData, widgetId);

        // if (result) {
        //     if(props.afterSubmitUrl) {
        //         location.href = props.afterSubmitUrl.replace("[id]", result.id)
        //     } else {
        //         notifyCreate();
        //     }
        // }

        const finalFormData = configureFormData(formData, true);

        try {
            const result = await createResource(finalFormData, props.widgetId);
            if (result) {
                if(props.redirectUrl) {
                    let redirectUrl = props.redirectUrl.replace("[id]", result.id);
                    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                        redirectUrl = document.location.origin + '/' + (redirectUrl.startsWith('/') ? redirectUrl.substring(1) : redirectUrl);
                    }
                    document.location.href = redirectUrl.replace("[id]", result.id)
                } else {
                    notifySuccess();
                }
            }
        } catch (e) {
            notifyFailed();
        }
    }


    return (
        <div className="osc">
            <div className="osc-resource-form-item-content">
                {props.displayTitle && props.title && <h4>{props.title}</h4>}
                <div className="osc-resource-form-item-description">
                    {props.displayDescription && props.description && (
                        <p>{props.description}</p>
                    )}
                </div>

                {!hasRole(currentUser, 'member') ? (
                    <>
                        <Banner className="big">
                            <h6>{loginText || 'Inloggen om deel te nemen.'}</h6>
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
                        title=""
                        submitText={submitButton || "Versturen"}
                        submitHandler={onSubmit}
                        secondaryLabel={saveConceptButton || ""}
                        {...props}
                    />
                )}

                <Toaster />
            </div>
        </div>
    );
}

ResourceFormWidget.loadWidget = loadWidget;
export { ResourceFormWidget };
