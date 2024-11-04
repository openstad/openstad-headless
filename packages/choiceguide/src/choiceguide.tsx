import React, { useEffect, useState, useRef } from 'react';
import { ChoiceGuideProps, WeightOverview } from "./props.js";
import { InitializeFormFields } from "./parts/init-fields.js";
import toast, { Toaster } from 'react-hot-toast';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import Form from "@openstad-headless/form/src/form";
import { ChoiceGuideSidebar } from "./includes/sidebar.js";
import './style.css';
import { InitializeWeights } from "./parts/init-weights.js";
import { FormValue } from "@openstad-headless/form/src/form";

import { Heading4, Paragraph } from "@utrecht/component-library-react";

function ChoiceGuide(props: ChoiceGuideProps) {
    const { choiceGuide, items, choiceOption, widgetId } = props;
    const {
        submit: { submitButton, saveConceptButton } = {},
        introTitle,
        introDescription,
        noOfQuestionsToShow,
        afterUrl
    } = choiceGuide;

    const formFields = InitializeFormFields(items, props);

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

    const datastore: any = new DataStore({
        projectId: props.projectId,
        api: props.api,
    });

    const {
        data: currentUser,
        error: currentUserError,
        isLoading: currentUserIsLoading,
    } = datastore.useCurrentUser({ ...props });

    const questionsPerPage = Number(noOfQuestionsToShow) || 100;
    const totalPages = Math.ceil(formFields.length / questionsPerPage);
    const currentFields = formFields.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

    const notifySuccess = () =>
      toast.success('Versturen gelukt', { position: 'bottom-center' });

    const notifyFailed = () =>
      toast.error('Versturen mislukt', { position: 'bottom-center' });

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
                    submitText={currentPage < totalPages - 1 ? "Volgende" : (submitButton || "Versturen")}
                    submitHandler={onSubmit}
                    secondaryLabel={saveConceptButton || ""}
                    getValuesOnChange={setCurrentAnswers}
                    allowResetAfterSubmit={false}
                    {...props}
                  />
                  <Toaster />
                  <div className="osc-choiceguide-navigation">
                      {currentPage > 0 && (
                        <button
                          type="button"
                          className="osc-prev-button"
                          onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
                        >
                            Vorige
                        </button>
                      )}
                  </div>
              </div>
              <div className="osc-choiceguide-sidebar-container" ref={sidebarRef}>
                  <ChoiceGuideSidebar
                    {...choiceGuide}
                    choiceOptions={choiceOption?.choiceOptions}
                    weights={weights}
                    answers={answers}
                    widgetId={widgetId}
                  />
              </div>
          </div>
      </div>
    );
}

ChoiceGuide.loadWidget = loadWidget;
export { ChoiceGuide };
