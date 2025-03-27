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
    const [completeAnswers, setCompleteAnswers] = useState<{ [key: string]: FormValue }>({});
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [currentAnswers, setCurrentAnswers] = useState<{ [key: string]: string }>({});

    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initialWeights = InitializeWeights(items, choiceOption?.choiceOptions);
        setWeights(initialWeights);
    }, [items, choiceOption]);

    useEffect(() => {
        const updatedAnswers = { ...answers, ...currentAnswers };
        setAnswers(updatedAnswers);
    }, [currentAnswers]);

    const questionsPerPage = Number(noOfQuestionsToShow) || 100;
    const totalPages = Math.ceil(formFields.length / questionsPerPage);
    const currentFields = formFields.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

    const notifySuccess = () => NotificationService.addNotification("Versturen gelukt", "success");
    const notifyFailed = () => NotificationService.addNotification("Versturen mislukt", "error");

    const { create: createChoicesguideResult } = datastore.useChoicesguide({
        projectId: props.projectId,
    });
    const onSubmit = async (formData: any) => {
        setCompleteAnswers((prevAnswers) => ({
            ...prevAnswers,
            ...formData
        }));

        const finalAnswers = { ...completeAnswers, ...formData };

        if (currentPage < totalPages - 1) {
            setCurrentPage((prevPage) => prevPage + 1);
        } else {

            const projectId = props.projectId; // Assume projectId is available in props
            const widgetId = props.widgetId;
            const storageKey = `choiceguide-${projectId}-${widgetId}`;

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
        }
    };

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
                    fields={currentFields}
                    title=""
                    submitText={currentPage < totalPages - 1 ? (nextButtonText || "Volgende") : (submitButtonText || "Versturen")}
                    submitHandler={onSubmit}
                    secondaryLabel={""}
                    getValuesOnChange={setCurrentAnswers}
                    allowResetAfterSubmit={false}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    prevPage={currentPage > 0 ? currentPage - 1 : null}
                    submitDisabled={!showForm}
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
                      />
                  )}
              </div>
          </div>
      </div>
    );
}

ChoiceGuide.loadWidget = loadWidget;
export { ChoiceGuide };
