import React from 'react';
import hasRole from '../../lib/has-role';
import {ResourceFormWidgetProps} from "./props.js";
import {Banner, Button, Spacer} from "@openstad-headless/ui/src/index.js";
import {InitializeFormFields} from "./parts/init-fields.js";
import toast, { Toaster } from 'react-hot-toast';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import { loadWidget } from '@openstad-headless/lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import Form from "@openstad-headless/form/src/form";

function ResourceFormWidget(props: ResourceFormWidgetProps) {
    const { submitButton, saveConceptButton} = props.submit  || {}; //TODO add saveButton variable. Unused variables cause errors in the admin
    const { loginText, loginButtonText, viewable} = props.info  || {}; //TODO add nameInHeader variable. Unused variables cause errors in the admin

    const notifyCreate = () =>
        toast.success('Idee ingedient', { position: 'bottom-center' });

    //
    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const { data, create: createResource } = datastore.useResources({
        projectId: props.projectId,
    });

    const {
        data: currentUser,
        error: currentUserError,
        isLoading: currentUserIsLoading,
    } = datastore.useCurrentUser({ ...props });

    async function onSubmit(formData: any) {
        // const result = await data.records.create(formData);
        const result = await createResource(formData, props.widgetId);

        if (result) {
            if(props.afterSubmitUrl) {
                location.href = props.afterSubmitUrl.replace("[id]", result.id)
            } else {
                notifyCreate();
            }
        }
    }

    const formFields = InitializeFormFields(props.items);

    return (
        <div className="osc">
            <div className="osc-resource-form-item-content">
                {props.displayTitle && props.title && <h4>{props.title}</h4>}
                <div className="osc-resource-form-item-description">
                    {props.displayDescription && props.description && (
                        <p>{props.description}</p>
                    )}
                </div>

                {!hasRole(currentUser, 'member') && viewable === 'users' ? (
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
                    />
                )}

                <Toaster />
            </div>
        </div>
    );
}

ResourceFormWidget.loadWidget = loadWidget;
export { ResourceFormWidget };
