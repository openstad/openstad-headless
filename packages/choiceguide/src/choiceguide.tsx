import React, { useEffect, useState, useRef } from 'react';
import { ChoiceGuideProps, WeightOverview } from "./props.js";
import { InitializeFormFields } from "./parts/init-fields.js";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import Form from "@openstad-headless/form/src/form";
import { ChoiceGuideSidebar } from "./includes/sidebar.js";
import './style.css';
import { InitializeWeights } from "./parts/init-weights.js";
import { FormValue } from "@openstad-headless/form/src/form";

import { Heading4, Heading6, Paragraph } from "@utrecht/component-library-react";
import NotificationService from "../../lib/NotificationProvider/notification-service";
import NotificationProvider from "../../lib/NotificationProvider/notification-provider";
import hasRole from '../../lib/has-role';
import {Banner, Button, Spacer} from "@openstad-headless/ui/src";

function ChoiceGuide(props: ChoiceGuideProps) {
    const { choiceGuide = {}, items, choiceOption, widgetId, generalSettings = {} } = props;
    const {
        introTitle,
        introDescription,
        noOfQuestionsToShow,
        afterUrl,
        choicesType
    } = choiceGuide;

    const {
        submitButtonText,
        nextButtonText,
        loginRequired,
        loginText,
        loginTextButton
    } = generalSettings;

    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const {
        data: currentUser,
        error: currentUserError,
        isLoading: currentUserIsLoading,
    } = datastore.useCurrentUser({ ...props });

    const onlyShowForUsers = typeof loginRequired !== 'undefined' && loginRequired
    const showForm = onlyShowForUsers ? !!hasRole(currentUser, 'member') : true;

    const formFields = InitializeFormFields(items, props, showForm);

    const defaultAnswers = formFields.reduce((acc, item) => {
        acc[item.fieldKey] = item?.defaultValue;
        return acc;
    }, {});

    const [weights, setWeights] = useState<WeightOverview>({});
    const [answers, setAnswers] = useState<{ [key: string]: FormValue }>(defaultAnswers);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: string }>({});
    const [hiddenFields, setHiddenFields ] = useState< string[] >([]);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initialWeights = InitializeWeights(items, choiceOption?.choiceOptions, choicesType, hiddenFields);
        setWeights(initialWeights);
    }, [items, choiceOption, hiddenFields]);

    const getChangedAnswers = (newAnswers: { [key: string]: string}, newHiddenFields: string[]) => {
        if (
          newHiddenFields.length !== hiddenFields.length ||
          !newHiddenFields.every(field => hiddenFields.includes(field))
        ) {
            setHiddenFields(newHiddenFields);
        }

        let answersChanged = false;
        Object.keys(newAnswers).forEach((key) => {
            if (JSON.stringify(newAnswers[key]) !== JSON.stringify(currentAnswers[key])) {
                answersChanged = true;
            }
        });

        if (answersChanged) {
            setCurrentAnswers(newAnswers);
        }
    }

    useEffect(() => {
        const updatedAnswers = { ...answers, ...currentAnswers };
        setAnswers(updatedAnswers);
    }, [currentAnswers]);

    const notifySuccess = () => NotificationService.addNotification("Versturen gelukt", "success");
    const notifyFailed = () => NotificationService.addNotification("Versturen mislukt", "error");

    const { create: createChoicesguideResult } = datastore.useChoicesguide({
        projectId: props.projectId,
    });
    const onSubmit = async (formData: any) => {
        const projectId = props.projectId; // Assume projectId is available in props
        const widgetId = props.widgetId;
        const storageKey = `choiceguide-${projectId}-${widgetId}`;

        const finalAnswers = { ...formData, hiddenFields };
        // Store in local storage
        localStorage.setItem(storageKey, JSON.stringify(finalAnswers));

        try {
            const result = await createChoicesguideResult(finalAnswers ,props.widgetId);
            if (result) {
                notifySuccess();

                if(afterUrl) {
                    location.href = afterUrl || '/';
                }
            }
        } catch (e) {
            console.log('Error', e);
            notifyFailed();
        }
    };

    const questionsPerPage = Number(noOfQuestionsToShow) || 100;
    const totalPages = Math.ceil(formFields.length / questionsPerPage);

    const paginationFieldPositions: number[] = [];
    for (let i = 0; i < totalPages - 1; i++) {
        const endIndex = (i + 1) * questionsPerPage - 1;
        paginationFieldPositions.push(endIndex);
    }

    // Add start and end indices for slicing
    const pageFieldStartPositions = [0, ...paginationFieldPositions.map(idx => idx + 1)];
    const pageFieldEndPositions = [...paginationFieldPositions, formFields.length];

    return (
      <div className="osc">
          <div className="osc-choiceguide-container" ref={containerRef}>
              <div className="osc-choiceguide-form">

                  { !showForm && (
                      <>
                          <Banner className="big">
                              <Heading6>{ loginText || "Inloggen om deel te nemen."}</Heading6>
                              <Spacer size={1} />
                              <Button
                                type="button"
                                onClick={() => {
                                    document.location.href = props.login?.url || '';
                                }}>
                                  { loginTextButton || "Inloggen"}
                              </Button>
                          </Banner>
                          <Spacer size={2} />
                      </>
                  )}

                  <div className="osc-choiceguide-intro">
                      {introTitle && <Heading4>{introTitle}</Heading4>}
                      <div className="osc-choiceguide-intro-description">
                          {introDescription && (
                            <Paragraph>{introDescription}</Paragraph>
                          )}
                      </div>
                  </div>
                  <Form
                    fields={formFields}
                    title=""
                    submitText={currentPage < totalPages - 1 ? (nextButtonText || "Volgende") : (submitButtonText || "Versturen")}
                    submitHandler={onSubmit}
                    secondaryLabel={""}
                    getValuesOnChange={(currentAnswers:{ [key: string]: string}, hiddenFields) => getChangedAnswers(currentAnswers, hiddenFields)}
                    allowResetAfterSubmit={false}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    prevPage={currentPage > 0 ? currentPage - 1 : null}
                    submitDisabled={!showForm}
                    prevPageText={"Vorige"}
                    pageFieldStartPositions={pageFieldStartPositions}
                    pageFieldEndPositions={pageFieldEndPositions}
                    totalPages={totalPages}
                    {...props}
                  />
                  <NotificationProvider />
              </div>
              <div className="osc-choiceguide-sidebar-container" ref={sidebarRef}>
                  {choicesType !== 'hidden' && (
                      <ChoiceGuideSidebar
                        {...choiceGuide}
                        choiceOptions={choiceOption?.choiceOptions}
                        weights={weights}
                        answers={answers}
                        widgetId={widgetId}
                        hiddenFields={hiddenFields}
                        items={formFields}
                      />
                  )}
              </div>
          </div>
      </div>
    );
}

ChoiceGuide.loadWidget = loadWidget;
export { ChoiceGuide };
