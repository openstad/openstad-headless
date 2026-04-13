import DataStore from '@openstad-headless/data-store/src';
import Form from '@openstad-headless/form/src/form';
import type { FormValue } from '@openstad-headless/form/src/form';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { Banner, Button, Spacer } from '@openstad-headless/ui/src';
import {
  Heading4,
  Heading6,
  Paragraph,
} from '@utrecht/component-library-react';
import React, { useEffect, useRef, useState } from 'react';

import NotificationProvider from '../../lib/NotificationProvider/notification-provider';
import NotificationService from '../../lib/NotificationProvider/notification-service';
import hasRole from '../../lib/has-role';
import RteContent from '../../ui/src/rte-formatting/rte-content';
import { ChoiceGuideSidebar } from './includes/sidebar.js';
import { InitializeFormFields } from './parts/init-fields.js';
import { InitializeWeights } from './parts/init-weights.js';
import type { ChoiceGuideProps, WeightOverview } from './props.js';
import './style.css';

function ChoiceGuide(props: ChoiceGuideProps) {
  const {
    choiceGuide = {},
    items,
    choiceOption,
    widgetId,
    generalSettings = {},
  } = props;
  const {
    introTitle,
    introDescription,
    noOfQuestionsToShow,
    afterUrl,
    choicesType,
    showBackButtonInTopOfPage,
  } = choiceGuide;

  const {
    submitButtonText,
    nextButtonText,
    loginRequired,
    loginText,
    loginTextButton,
    stickyBarAtTop,
    stickyBarDefaultOpen,
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

  const onlyShowForUsers =
    typeof loginRequired !== 'undefined' && loginRequired;
  const showForm = onlyShowForUsers ? !!hasRole(currentUser, 'member') : true;

  const formFields = InitializeFormFields(items, props, showForm);

  const defaultAnswers = formFields.reduce((acc, item) => {
    acc[item.fieldKey] = item?.defaultValue;
    return acc;
  }, {});

  const [weights, setWeights] = useState<WeightOverview>({});
  const [answers, setAnswers] = useState<{ [key: string]: FormValue }>(
    defaultAnswers
  );
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentAnswers, setCurrentAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [hiddenFields, setHiddenFields] = useState<Array<string>>([]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const initialWeights = InitializeWeights(
      items,
      choiceOption?.choiceOptions,
      choicesType,
      hiddenFields
    );
    setWeights(initialWeights);
  }, [items, choiceOption, hiddenFields]);

  const getChangedAnswers = (
    newAnswers: { [key: string]: string },
    newHiddenFields: Array<string>
  ) => {
    if (
      newHiddenFields.length !== hiddenFields.length ||
      !newHiddenFields.every((field) => hiddenFields.includes(field))
    ) {
      setHiddenFields(newHiddenFields);
    }

    let answersChanged = false;
    Object.keys(newAnswers).forEach((key) => {
      if (
        JSON.stringify(newAnswers[key]) !== JSON.stringify(currentAnswers[key])
      ) {
        answersChanged = true;
      }
    });

    if (answersChanged) {
      setCurrentAnswers(newAnswers);
    }
  };

  useEffect(() => {
    const updatedAnswers = { ...answers, ...currentAnswers };
    setAnswers(updatedAnswers);
  }, [currentAnswers]);

  const notifySuccess = () =>
    NotificationService.addNotification('Versturen gelukt', 'success');
  const notifyFailed = () =>
    NotificationService.addNotification('Versturen mislukt', 'error');

  const { create: createChoicesguideResult } = datastore.useChoicesguide({
    projectId: props.projectId,
  });
  const onSubmit = async (formData: any) => {
    const projectId = props.projectId; // Assume projectId is available in props
    const widgetId = props.widgetId;
    const storageKey = `choiceguide-${projectId}-${widgetId}`;

    const finalAnswers = {
      ...formData,
      hiddenFields,
      __timeToSubmitMs: Math.max(Date.now() - formStartTimeRef.current, 0),
    };
    // Store in local storage
    localStorage.setItem(storageKey, JSON.stringify(finalAnswers));

    try {
      const result = await createChoicesguideResult(
        finalAnswers,
        props.widgetId
      );
      if (result) {
        notifySuccess();

        if (afterUrl) {
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

  const paginationFieldPositions: Array<number> = [];
  for (let i = 0; i < totalPages - 1; i++) {
    const endIndex = (i + 1) * questionsPerPage;
    paginationFieldPositions.push(endIndex);
  }

  // Add start and end indices for slicing
  const pageFieldStartPositions = [0, ...paginationFieldPositions];
  const pageFieldEndPositions = [
    ...paginationFieldPositions,
    formFields.length,
  ];

  return (
    <div className="osc">
      <div
        className={`osc-choiceguide-container ${
          stickyBarAtTop ? 'sticky-top-bar' : ''
        }`}
        ref={containerRef}>
        <div className="osc-choiceguide-form">
          {!showForm && (
            <>
              <Banner className="big">
                <Heading6>{loginText || 'Inloggen om deel te nemen.'}</Heading6>
                <Spacer size={1} />
                <Button
                  onClick={() => {
                    document.location.href = props.login?.url || '';
                  }}
                  type="button">
                  {loginTextButton || 'Inloggen'}
                </Button>
              </Banner>
              <Spacer size={2} />
            </>
          )}

          <div className="osc-choiceguide-intro">
            {introTitle ? (
              <RteContent
                content={introTitle}
                inlineComponent={Heading4}
                unwrapSingleRootDiv
              />
            ) : null}
            <div className="osc-choiceguide-intro-description">
              {introDescription ? (
                <RteContent
                  content={introDescription}
                  inlineComponent={Paragraph}
                  unwrapSingleRootDiv
                />
              ) : null}
            </div>
          </div>
          <Form
            allowResetAfterSubmit={false}
            currentPage={currentPage}
            fields={formFields}
            getValuesOnChange={(
              currentAnswers: { [key: string]: string },
              hiddenFields
            ) => getChangedAnswers(currentAnswers, hiddenFields)}
            pageFieldEndPositions={pageFieldEndPositions}
            pageFieldStartPositions={pageFieldStartPositions}
            prevPage={currentPage > 0 ? currentPage - 1 : null}
            prevPageText="Vorige"
            secondaryLabel=""
            setCurrentPage={setCurrentPage}
            showBackButtonInTopOfPage={showBackButtonInTopOfPage || false}
            submitDisabled={!showForm}
            submitHandler={onSubmit}
            submitText={
              currentPage < totalPages - 1
                ? nextButtonText || 'Volgende'
                : submitButtonText || 'Versturen'
            }
            title=""
            totalPages={totalPages}
            {...props}
          />
          <NotificationProvider />
        </div>
        <div className="osc-choiceguide-sidebar-container" ref={sidebarRef}>
          {choicesType !== 'hidden' && (
            <ChoiceGuideSidebar
              {...choiceGuide}
              answers={answers}
              choiceOptions={choiceOption?.choiceOptions}
              hiddenFields={hiddenFields}
              items={formFields}
              stickyBarDefaultOpen={stickyBarDefaultOpen}
              weights={weights}
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
