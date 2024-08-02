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
import { prepareAnwers } from "./parts/prepare-answers.js";
import { FormValue } from "@openstad-headless/form/src/form";

function ChoiceGuide(props: ChoiceGuideProps) {
    const { choiceGuide, items, choiceOption, widgetId } = props;
    const {
        submit: { submitButton, saveConceptButton } = {},
        introTitle,
        introDescription,
        projectId,
        api,
        startWithAllQuestionsAnswered,
        noOfQuestionsToShow
    } = choiceGuide;

    const formFields = InitializeFormFields(items, props, startWithAllQuestionsAnswered);

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

    const handleScroll = () => {
        if (sidebarRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            const sidebarHeight = sidebarRef.current.offsetHeight;

            // Determine the right offset
            const containerRightOffset = window.innerWidth - containerRect.right;

            // Check if the container's top is within view
            if (containerRect.top <= 0 && containerRect.bottom > sidebarHeight) {
                sidebarRef.current.style.position = 'fixed';
                sidebarRef.current.style.top = '0';
                sidebarRef.current.style.bottom = 'auto';
                sidebarRef.current.style.right = `${containerRightOffset}px`;
            } else if (containerRect.bottom <= sidebarHeight) {
                sidebarRef.current.style.position = 'absolute';
                sidebarRef.current.style.top = 'auto';
                sidebarRef.current.style.bottom = '0';
                sidebarRef.current.style.right = '0'; // Adjust for right alignment within the container
            } else {
                sidebarRef.current.style.position = 'absolute';
                sidebarRef.current.style.top = '0';
                sidebarRef.current.style.bottom = 'auto';
                sidebarRef.current.style.right = '0'; // Reset right alignment within the container
            }
        }
    };


    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const datastore: any = new DataStore({
        projectId,
        api,
    });

    const {
        data: currentUser,
        error: currentUserError,
        isLoading: currentUserIsLoading,
    } = datastore.useCurrentUser({ ...props });

    const questionsPerPage = Number(noOfQuestionsToShow) || 100;
    const totalPages = Math.ceil(formFields.length / questionsPerPage);
    const currentFields = formFields.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

    const onSubmit = (formData: any) => {
        const newAnswers = prepareAnwers(formData, weights);
        setCompleteAnswers((prevAnswers) => ({
            ...prevAnswers,
            ...newAnswers
        }));

        if (currentPage < totalPages - 1) {
            setCurrentPage((prevPage) => prevPage + 1);
        } else {
            console.log('Final submit', { ...completeAnswers, ...newAnswers });
            toast.success('Formulier succesvol ingediend!');
        }
    };

    return (
      <div className="osc">
          <div className="osc-choiceguide-container" ref={containerRef}>
              <div className="osc-choiceguide-form">
                  <div className="osc-choiceguide-intro">
                      {introTitle && <h4>{introTitle}</h4>}
                      <div className="osc-choiceguide-intro-description">
                          {introDescription && (
                            <p>{introDescription}</p>
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
