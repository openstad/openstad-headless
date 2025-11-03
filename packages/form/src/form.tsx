import React, { useEffect, useRef, useState } from 'react';
import type { CombinedFieldPropsWithType, ComponentFieldProps, FormProps } from "./props";
import TextInput from "@openstad-headless/ui/src/form-elements/text";
import RangeSlider from "@openstad-headless/ui/src/form-elements/a-b-slider";
import CheckboxField from "@openstad-headless/ui/src/form-elements/checkbox";
import RadioboxField from "@openstad-headless/ui/src/form-elements/radio";
import SelectField from "@openstad-headless/ui/src/form-elements/select";
import TickmarkSlider from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import ImageUploadField from "@openstad-headless/ui/src/form-elements/image-upload";
import DocumentUploadField from "@openstad-headless/ui/src/form-elements/document-upload";
import MapField from "@openstad-headless/ui/src/form-elements/map";
import { handleSubmit } from "./utils/submit";
import { updateRouting } from "./utils/routing";
import HiddenInput from "@openstad-headless/ui/src/form-elements/hidden";
import ImageChoiceField from "@openstad-headless/ui/src/form-elements/image-choice";
import InfoField from "@openstad-headless/ui/src/form-elements/info";
import SwipeField from "@openstad-headless/swipe/src/swipe";
import DilemmaField from '@openstad-headless/dilemma/src/dilemma';
import NumberInput from '@openstad-headless/ui/src/form-elements/number';
import MatrixField from "@openstad-headless/ui/src/form-elements/matrix";
import SortField from "@openstad-headless/ui/src/form-elements/sort";
import { FormFieldErrorMessage, Button } from "@utrecht/component-library-react";
import './form.css'

export type FormValue = string | string[] | Record<number, never> | Record<string, any> | [] | number | boolean | { name: string; url: string }[];

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";

function Form({
    title = 'Form Widget',
    fields = [],
    submitText = 'Verzenden',
    submitHandler = () => { },
    submitDisabled = false,
    secondaryLabel = '',
    secondaryHandler = () => { },
    getValuesOnChange = () => { },
    allowResetAfterSubmit = true,
    currentPage,
    setCurrentPage,
    prevPage,
    prevPageText,
    pageFieldStartPositions,
    pageFieldEndPositions,
    totalPages,
    showBackButtonInTopOfPage = false,
    totalFieldCount = 0,
    formStyle = 'default',
    ...props
}: FormProps) {
    const initialFormValues: { [key: string]: FormValue } = {};
    const initialHiddenFields: string[] = [];
    const fieldsWithImpactOnRouting: string[] = [];

    fields.forEach((field) => {
        const fieldKey = field.fieldKey || '';

        if (fieldKey) {
            initialFormValues[fieldKey] = typeof field.defaultValue !== 'undefined' ? field.defaultValue : '';
            initialFormValues[fieldKey] = field.type === 'map' ? {} : initialFormValues[fieldKey];

            if (field.type === 'tickmark-slider') {
                initialFormValues[fieldKey] = Math.ceil((field?.fieldOptions?.length || 2) / 2).toString();
            }

            if (field?.routingInitiallyHide && field?.routingSelectedQuestion && field?.routingSelectedAnswer) {
                const getRoutingSelectedQuestionField = fields.find((f) => f.trigger === field.routingSelectedQuestion);
                const routingSelectedQuestionFieldKey = getRoutingSelectedQuestionField?.fieldKey || '';

                fieldsWithImpactOnRouting.push(routingSelectedQuestionFieldKey);
                initialHiddenFields.push(fieldKey);
            }
        }
    });

    const [formValues, setFormValues] = useState(initialFormValues);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string | null }>({});
    const formRef = useRef<HTMLFormElement>(null);
    const resetFunctions = useRef<Array<() => void>>([]);
    const [routingHiddenFields, setRoutingHiddenFields] = useState<Array<string>>(initialHiddenFields);
    const [lastUpdatedKey, setLastUpdatedKey] = useState<string>('');

    let fieldsToRender = fields;
    if (typeof currentPage === 'number' && typeof pageFieldStartPositions !== 'undefined' && typeof pageFieldEndPositions !== 'undefined') {
        const start = pageFieldStartPositions[currentPage];
        const end = pageFieldEndPositions[currentPage];

        fieldsToRender = fields.slice(start, end);
    }

    const handleFormSubmit = (event: React.FormEvent) => {
        const nonPaginationFields = fields.filter(field => field.type !== 'pagination');

        let pageHandler = undefined;
        if (typeof currentPage === 'number' && typeof totalPages === 'number' && currentPage < totalPages - 1 && setCurrentPage && typeof currentPage === 'number' && typeof totalPages === 'number' && currentPage < totalPages - 1 && !(currentPage === totalPages - 2 && (nonPaginationFields[totalPages - 1] as any)?.infoBlockStyle === 'youth-outro')) {
            allowResetAfterSubmit = false;
            pageHandler = () => setCurrentPage(currentPage + 1);
        }

        event.preventDefault();
        const firstErrorKey = handleSubmit(
            fieldsToRender as unknown as Array<CombinedFieldPropsWithType>,
            formValues,
            setFormErrors,
            routingHiddenFields,
            submitHandler,
            pageHandler,
        );

        if (firstErrorKey && formRef.current) {
            const errorElement = formRef.current.querySelector(`[name="${firstErrorKey}"]`);
            if (errorElement) {
                const elementPosition = errorElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - 100;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } else if (allowResetAfterSubmit) {
            resetForm();
        }
    };

    const handleInputChange = (event: { name: string, value: FormValue }, triggerSetLastKey: boolean = true) => {
        const { name, value } = event;
        setFormValues((prevFormValues) => ({ ...prevFormValues, [name]: value }));

        if (triggerSetLastKey) {
            setLastUpdatedKey(name);
        }
    };

    const resetForm = () => {
        setFormValues(initialFormValues);
        setFormErrors({});
        resetFunctions.current.forEach(reset => reset());
    };

    useEffect(() => {
        if (getValuesOnChange) {
            getValuesOnChange(formValues, routingHiddenFields)
        }

        if (lastUpdatedKey && fieldsWithImpactOnRouting.length > 0 && fieldsWithImpactOnRouting.includes(lastUpdatedKey)) {
            updateRouting({
                fields,
                initialFormValues,
                routingHiddenFields,
                setFormValues,
                setRoutingHiddenFields,
                formValues
            });
        }
    }, [formValues]);

    const scrollTop = () => {
        const formWidget = document.querySelector('.osc-enquete-item-content:not(.--youth)');
        if (formWidget) {
            const elementPosition = formWidget.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    const componentMap: { [key: string]: React.ComponentType<ComponentFieldProps> } = {
        swipe: SwipeField as React.ComponentType<ComponentFieldProps>,
        text: TextInput as React.ComponentType<ComponentFieldProps>,
        range: RangeSlider as React.ComponentType<ComponentFieldProps>,
        checkbox: CheckboxField as React.ComponentType<ComponentFieldProps>,
        radiobox: RadioboxField as React.ComponentType<ComponentFieldProps>,
        select: SelectField as React.ComponentType<ComponentFieldProps>,
        'tickmark-slider': TickmarkSlider as React.ComponentType<ComponentFieldProps>,
        imageUpload: ImageUploadField as React.ComponentType<ComponentFieldProps>,
        documentUpload: DocumentUploadField as React.ComponentType<ComponentFieldProps>,
        map: MapField as React.ComponentType<ComponentFieldProps>,
        hidden: HiddenInput as React.ComponentType<ComponentFieldProps>,
        imageChoice: ImageChoiceField as React.ComponentType<ComponentFieldProps>,
        number: NumberInput as React.ComponentType<ComponentFieldProps>,
        matrix: MatrixField as React.ComponentType<ComponentFieldProps>,
        none: InfoField as React.ComponentType<ComponentFieldProps>,
        sort: SortField as React.ComponentType<ComponentFieldProps>,
        dilemma: DilemmaField as React.ComponentType<ComponentFieldProps>,
    };

    const renderField = (field: ComponentFieldProps, index: number, randomId: string, fieldInvalid: boolean) => {
        if (!field.type) {
            return null;
        }
        const Component = componentMap[field.type];
        if (Component) {
            return (
                <Component
                    {...props}
                    index={index}
                    onChange={handleInputChange}
                    reset={(resetFn: () => void) => resetFunctions.current.push(resetFn)}
                    randomId={randomId}
                    fieldInvalid={fieldInvalid}
                    overrideDefaultValue={field.fieldKey && formValues[field.fieldKey]}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    {...field}
                />
            );
        }
    };

    return (
        <div className="form-widget">
            <div className="form-widget-container">
                {title && <h5 className="form-widget-title">{title}</h5>}

                { (!!showBackButtonInTopOfPage && currentPage > 0 ) && (
                  <div className="button-group --flex">
                      {currentPage > 0 && (
                        <Button
                          appearance='secondary-action-button'
                          type="button"
                          className="osc-prev-button"
                          onClick={() => {
                              setCurrentPage && setCurrentPage(currentPage - 1);
                              scrollTop();
                          }}
                        >
                            {prevPageText || 'vorige'}
                        </Button>
                      )}
                  </div>
                )}

                <form className="form-container" noValidate onSubmit={handleFormSubmit} ref={formRef}>
                    {formStyle === 'youth' && totalFieldCount > 0 && (
                        <ul className="form-fieldCounter">
                            {Array.from({ length: totalFieldCount }, (_, index) => (
                                <li key={index} className={`${currentPage === index ? '--active' : ''}`} aria-label={`Pagina ${index + 1}`}></li>
                            ))}
                        </ul>
                    )}

                    {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call */}
                    {fieldsToRender.map((field: ComponentFieldProps, index: number) => {
                        const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                        const fieldInvalid = Boolean(field.fieldKey && typeof (formErrors[field.fieldKey]) !== 'undefined');


                        if (field.fieldKey && routingHiddenFields.includes(field.fieldKey)) {
                            return null;
                        }
                        return field.type === 'pagination' ? null : (
                            // @ts-ignore
                            <div className={`question question-type-${field.type} --${field.infoBlockStyle || ''}`} key={index}>
                                {renderField(field, index, randomId, fieldInvalid)}
                                <FormFieldErrorMessage className="error-message">
                                    {field.fieldKey && formErrors[field.fieldKey] &&
                                        <span
                                            id={`${randomId}_error`}
                                            aria-live="assertive"
                                        >
                                            {formErrors[field.fieldKey]}
                                        </span>
                                    }
                                </FormFieldErrorMessage>
                                {/* @ts-ignore */}
                                {field.infoBlockStyle === "youth-outro" && (
                                    <div className="info-block-buttons">
                                        {/* @ts-ignore */}
                                        {field.infoBlockExtraButton && (
                                            /* @ts-ignore */
                                            <a className="update-button" href={field.infoBlockExtraButton} rel="noreferrer">
                                                <span>Blijf op de hoogte</span>
                                            </a>
                                        )}
                                        {/* @ts-ignore */}
                                        {field.infoBlockShareButton && (
                                            <div
                                                role="button"
                                                className="share-buttons"
                                                onClick={async () => {
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: document.title,
                                                            text: 'Deel deze pagina',
                                                            url: window.location.href,
                                                        }).catch(() => { });
                                                    } else if (navigator.clipboard) {
                                                        try {
                                                            await navigator.clipboard.writeText(window.location.href);
                                                            alert('Link gekopieerd naar klembord.');
                                                        } catch {
                                                            alert('Kopiëren naar klembord mislukt.');
                                                        }
                                                    } else {
                                                        alert('Delen wordt niet ondersteund op dit apparaat.');
                                                    }
                                                }}
                                            >
                                                <span>Delen</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {secondaryLabel && (
                        <Button
                            appearance='primary-action-button'
                            onClick={() => secondaryHandler(formValues)}
                            type="button"
                        >
                            <span>{secondaryLabel}</span>
                        </Button>
                    )}
                    <div className="button-group --flex">
                        {currentPage > 0 && (
                            <Button
                                appearance='secondary-action-button'
                                type="button"
                                className="osc-prev-button"
                                onClick={() => {
                                    setCurrentPage && setCurrentPage(currentPage - 1);
                                    scrollTop();
                                }}
                            >
                                <span>{prevPageText || 'vorige'}</span>
                            </Button>
                        )}
                        <Button
                            appearance='primary-action-button'
                            type="submit"
                            disabled={submitDisabled}
                            data-label="Overslaan"
                            onClick={() => {
                                scrollTop();
                            }}
                        >
                            <span>{submitText}</span>
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}

export default Form;
