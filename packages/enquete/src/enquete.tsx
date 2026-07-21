//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import Form, { FormValue } from '@openstad-headless/form/src/form';
import { FieldProps } from '@openstad-headless/form/src/props';
import {
  detectEnvironment,
  mapQuestionType,
  pushFormError,
  pushFormStart,
  pushFormStep,
  pushFormSubmit,
  pushQuestionInteract,
} from '@openstad-headless/lib/gtm-datalayer';
import type {
  DisplayType,
  FormStatus,
} from '@openstad-headless/lib/gtm-datalayer';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import {
  Banner,
  Button,
  Icon,
  Spacer,
  fireConfetti,
} from '@openstad-headless/ui/src';
import { Heading2, Heading6 } from '@utrecht/component-library-react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import NotificationProvider from '../../lib/NotificationProvider/notification-provider';
import NotificationService from '../../lib/NotificationProvider/notification-service';
import hasRole from '../../lib/has-role';
import RteContent from '../../ui/src/rte-formatting/rte-content';
import './enquete.scss';
import { buildQuestionIdMap, resolveQuestionId } from './gtm-helpers';
import { EnquetePropsType } from './types/';

// Helper types and functions for draft persistence

type EnqueteDraft = {
  data: Record<string, any>;
  updatedAt: number;
  version?: number;
};

function getStorageKey(
  projectId: string | number | undefined,
  widgetId: number | undefined,
  pathname: string
): string {
  const projectPart =
    typeof projectId !== 'undefined' ? String(projectId) : 'unknown-project';
  const widgetPart =
    typeof widgetId !== 'undefined' ? String(widgetId) : 'unknown-widget';
  return `enquete-draft:${projectPart}:${widgetPart}:${pathname}`;
}

function loadDraft(key: string, retentionHours: number): EnqueteDraft | null {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as EnqueteDraft | null;
    if (!parsed || typeof parsed.updatedAt !== 'number') {
      window.localStorage.removeItem(key);
      return null;
    }

    const maxAgeMs = retentionHours * 60 * 60 * 1000;
    const age = Date.now() - parsed.updatedAt;
    if (age > maxAgeMs) {
      window.localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return null;
  }
}

function saveDraft(key: string, data: Record<string, any>): void {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return;
  }

  const draft: EnqueteDraft = {
    data,
    updatedAt: Date.now(),
    version: 1,
  };

  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // ignore storage failures
  }
}

function clearDraft(key: string): void {
  if (
    typeof window === 'undefined' ||
    typeof window.localStorage === 'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export type EnqueteWidgetProps = BaseProps &
  ProjectSettingProps &
  EnquetePropsType & { infoBlockStyle?: string };

function Enquete(props: EnqueteWidgetProps) {
  const datastore = new DataStore(props);
  const notifyCreate = () =>
    NotificationService.addNotification('Enquete ingediend', 'success');

  const [savedDraft, setSavedDraft] = useState<Record<string, unknown> | null>(
    null
  );
  const [draftChecked, setDraftChecked] = useState(false);
  const latestValuesRef = useRef<Record<string, unknown> | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const formStartTimeRef = useRef<number>(Date.now());
  const formStartFiredRef = useRef(false);
  const interactedFieldsRef = useRef<Set<string>>(new Set());
  // Skip the form_step when loading the first page; it only fires on
  // the first interaction (together with form_start).
  const stepMountSkippedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDraftChecked(true);
      return;
    }

    const pathname = window.location.pathname;
    const storageKey = getStorageKey(props.projectId, props.widgetId, pathname);

    if (props.enableDraftPersistence !== true) {
      setDraftChecked(true);
      return;
    }

    const retentionHours = props.draftRetentionHours ?? 24;
    const draft = loadDraft(storageKey, retentionHours);
    if (draft && draft.data) {
      setSavedDraft(draft.data);
      latestValuesRef.current = draft.data;
    }
    setDraftChecked(true);
  }, [
    props.projectId,
    props.widgetId,
    props.enableDraftPersistence,
    props.draftRetentionHours,
  ]);

  const { create: createSubmission } = datastore.useSubmissions({
    projectId: props.projectId,
  });

  const {
    data: currentUser,
    // error: currentUserError,
    // isLoading: currentUserIsLoading,
  } = datastore.useCurrentUser({ ...props });

  const formOnlyVisibleForUsers =
    (!!props.formVisibility && props.formVisibility === 'users') ||
    !props.formVisibility;

  async function onSubmit(formData: Record<string, unknown>) {
    // Filter out pagination fields
    const nonPaginationFields = formFields.filter(
      (field) => field.type !== 'pagination'
    );

    formData.confirmationUser = props?.confirmation?.confirmationUser || false;
    formData.confirmationAdmin =
      props?.confirmation?.confirmationAdmin || false;
    formData.overwriteEmailAddress =
      formData.confirmationAdmin && props?.confirmation?.overwriteEmailAddress
        ? props?.confirmation?.overwriteEmailAddress
        : '';

    const getUserEmailFromField =
      formData.confirmationUser && !formOnlyVisibleForUsers;

    if (getUserEmailFromField) {
      const userEmailAddressFieldKey =
        props?.confirmation?.userEmailAddress || null;

      if (
        userEmailAddressFieldKey &&
        formData.hasOwnProperty(userEmailAddressFieldKey)
      ) {
        formData.userEmailAddress = formData[userEmailAddressFieldKey] || '';
      }
    }

    const embeddedUrl = window.location.href;

    const cleanUrlFromEndingQuestionMarks = (url: string) => {
      const length = url.length;
      let returnUrl = url;

      if (url.charAt(length - 1) === '?' || url.charAt(length - 1) === '&') {
        returnUrl = url.slice(0, length - 1);
      }

      return returnUrl;
    };

    formData.embeddedUrl = cleanUrlFromEndingQuestionMarks(embeddedUrl);
    formData.__timeToSubmitMs = Math.max(
      Date.now() - formStartTimeRef.current,
      0
    );

    const result = await createSubmission(formData, props.widgetId);

    if (result) {
      pushFormSubmit(getTrackingContext());

      console.log(
        `[enquete] submitted: widgetId=${props.widgetId} submissionId=${result.id}`
      );
      if (
        typeof window !== 'undefined' &&
        props.enableDraftPersistence === true
      ) {
        const pathname = window.location.pathname;
        const storageKey = getStorageKey(
          props.projectId,
          props.widgetId,
          pathname
        );
        clearDraft(storageKey);
        latestValuesRef.current = null;
      }

      if (props.afterSubmitUrl) {
        location.href = props.afterSubmitUrl.replace('[id]', result.id);
      } else {
        notifyCreate();
        if (
          (nonPaginationFields[currentPage + 1] as any)?.infoBlockStyle ===
          'youth-outro'
        ) {
          // if the page is youth outro, fire confetti
          fireConfetti();
        }
      }
    }
  }

  const formFields: FieldProps[] = [];
  if (
    typeof props !== 'undefined' &&
    typeof props.items === 'object' &&
    props.items.length > 0
  ) {
    for (const item of props.items) {
      const fieldData: any = {
        title: item.title,
        description: item.description,
        fieldKey: item.fieldKey,
        disabled: !hasRole(currentUser, 'member') && formOnlyVisibleForUsers,
        fieldRequired: item.fieldRequired,
        routingInitiallyHide: item.routingInitiallyHide || false,
        routingSelectedQuestion: item.routingSelectedQuestion || '',
        routingSelectedAnswer: item.routingSelectedAnswer || '',
        trigger: item.trigger || '',
      };
      const draftValue =
        item.fieldKey && savedDraft && savedDraft[item.fieldKey] !== undefined
          ? savedDraft[item.fieldKey]
          : undefined;
      switch (item.questionType) {
        case 'open':
          fieldData['type'] = 'text';
          fieldData['variant'] = item.variant;
          fieldData['minCharacters'] = item.minCharacters || '0';
          fieldData['maxCharacters'] = item.maxCharacters || '';
          fieldData['rows'] = 5;
          fieldData['placeholder'] = item.placeholder || '';
          fieldData['defaultValue'] =
            draftValue !== undefined ? draftValue : item.defaultValue || '';
          fieldData['maxCharactersWarning'] =
            props?.maxCharactersWarning ||
            'Je hebt nog {maxCharacters} tekens over';
          fieldData['minCharactersWarning'] =
            props?.minCharactersWarning ||
            'Nog minimaal {minCharacters} tekens';
          fieldData['maxCharactersError'] =
            props?.maxCharactersError ||
            'Tekst moet maximaal {maxCharacters} karakters bevatten';
          fieldData['minCharactersError'] =
            props?.minCharactersError ||
            'Tekst moet minimaal {minCharacters} karakters bevatten';
          fieldData['showMinMaxAfterBlur'] =
            props?.showMinMaxAfterBlur || false;
          fieldData['maxCharactersOverWarning'] =
            props?.maxCharactersOverWarning ||
            'Je hebt {overCharacters} tekens teveel';
          break;
        case 'multiplechoice':
        case 'multiple': {
          fieldData['type'] =
            item.questionType === 'multiplechoice' ? 'radiobox' : 'checkbox';
          fieldData['randomizeItems'] = item.randomizeItems || false;

          const configuredDefault: string[] = [];

          if (item.options && item.options.length > 0) {
            fieldData['choices'] = item.options.map((option) => {
              if (option.titles[0].defaultValue) {
                configuredDefault.push(option.titles[0].key);
              }

              return {
                value: option.titles[0].key,
                label: option.titles[0].key,
                isOtherOption: option.titles[0].isOtherOption,
                defaultValue: option.titles[0].defaultValue,
                trigger: option.trigger || '',
                ...(props.isQuiz
                  ? {
                      isCorrect: option.titles[0].isCorrect,
                      feedbackText: option.titles[0].feedbackText,
                    }
                  : {}),
              };
            });
          }

          if (props.isQuiz) {
            fieldData['feedbackMode'] = item.feedbackMode;
            fieldData['feedbackText'] = item.feedbackText;
            fieldData['feedbackCorrect'] = item.feedbackCorrect;
            fieldData['feedbackIncorrect'] = item.feedbackIncorrect;
          }

          if (draftValue !== undefined) {
            // For radiobox, draftValue is a single string; for checkbox, array of strings.
            fieldData['defaultValue'] = draftValue;
          } else if (configuredDefault.length > 0) {
            fieldData['defaultValue'] =
              item.questionType === 'multiplechoice'
                ? configuredDefault[0]
                : configuredDefault;
          }

          if (item.maxChoices) {
            fieldData['maxChoices'] = item.maxChoices;
          }
          if (item.maxChoicesMessage) {
            fieldData['maxChoicesMessage'] = item.maxChoicesMessage;
          }
          if (item.minChoices) {
            fieldData['minChoices'] = item.minChoices;
          }
          if (item.minChoicesMessage) {
            fieldData['minChoicesMessage'] = item.minChoicesMessage;
          }

          break;
        }
        case 'images':
          fieldData['type'] = 'imageChoice';
          fieldData['multiple'] = item.multiple || false;
          fieldData['infoField'] = item.infoField || '';

          if (item.options && item.options.length > 0) {
            fieldData['choices'] = item.options.map((option) => {
              return {
                value: option.titles[0].key,
                label: option.titles[0].key,
                imageSrc: option.titles[0].image,
                imageAlt: option.titles[0].key,
                hideLabel: option.titles[0].hideLabel,
                trigger: option.trigger || '',
                description: option.titles[0].description || '',
              };
            });
          } else {
            fieldData['choices'] = [
              {
                label: item?.text1 || '',
                value: item?.key1 || '',
                imageSrc: item?.image1 || '',
              },
              {
                label: item?.text2 || '',
                value: item?.key2 || '',
                imageSrc: item?.image2 || '',
              },
            ];
          }

          if (item.maxChoices) {
            fieldData['maxChoices'] = item.maxChoices;
          }
          if (item.maxChoicesMessage) {
            fieldData['maxChoicesMessage'] = item.maxChoicesMessage;
          }

          break;
        case 'imageUpload':
          fieldData['type'] = 'imageUpload';
          fieldData['allowedTypes'] = ['image/*'];
          fieldData['imageUrl'] = props?.imageUrl;
          fieldData['multiple'] = item.multiple;
          fieldData['maxUploadSizeMB'] = item.maxUploadSizeMB ?? 25;
          break;
        case 'documentUpload':
          fieldData['type'] = 'documentUpload';
          fieldData['multiple'] = item.multiple;
          fieldData['maxUploadSizeMB'] = item.maxUploadSizeMB ?? 25;
          break;
        case 'scale': {
          fieldData['type'] = 'tickmark-slider';
          fieldData['showSmileys'] = item.showSmileys;

          const labelOptions = [
            <Icon icon="ri-emotion-unhappy-line" key={1} />,
            <Icon icon="ri-emotion-sad-line" key={2} />,
            <Icon icon="ri-emotion-normal-line" key={3} />,
            <Icon icon="ri-emotion-happy-line" key={4} />,
            <Icon icon="ri-emotion-laugh-line" key={5} />,
          ];

          if (props.formStyle === 'youth') {
            labelOptions[0] = <span key={1}>😡</span>;
            labelOptions[1] = <span key={2}>🙁</span>;
            labelOptions[2] = <span key={3}>😐</span>;
            labelOptions[3] = <span key={4}>😀</span>;
            labelOptions[4] = <span key={5}>😍</span>;
          }

          fieldData['fieldOptions'] = labelOptions.map((label, index) => {
            const currentValue = index + 1;
            return {
              value: currentValue.toString(),
              label: item.showSmileys ? label : currentValue,
            };
          });

          fieldData['choices'] = labelOptions.map((label, index) => {
            const currentValue = index + 1;
            return {
              value: currentValue.toString(),
              label: currentValue.toString(),
              trigger: `scale-${currentValue}`,
            };
          });

          // TickmarkSlider uses overrideDefaultValue (string) for its initial value
          if (
            draftValue !== undefined &&
            draftValue !== null &&
            draftValue !== ''
          ) {
            fieldData['overrideDefaultValue'] = String(draftValue);
          }

          if (props.isQuiz) {
            fieldData['feedbackMode'] = item.feedbackMode;
            fieldData['feedbackText'] = item.feedbackText;
            fieldData['scaleFeedback'] = item.scaleFeedback;
          }
          break;
        }
        case 'map':
          fieldData['type'] = 'map';
          if (!!props?.datalayer) {
            fieldData['datalayer'] = props?.datalayer;
          }
          if (typeof props?.enableOnOffSwitching === 'boolean') {
            fieldData['enableOnOffSwitching'] = props?.enableOnOffSwitching;
          }

          if (Array.isArray(props?.allowedPolygons)) {
            fieldData['allowedPolygons'] = props.allowedPolygons;
          }

          break;
        case 'pagination':
          fieldData['type'] = 'pagination';
          fieldData['prevPageText'] = item?.prevPageText || '1';
          fieldData['nextPageText'] = item?.nextPageText || '2';
          fieldData['stepName'] = item?.stepName || '';
          break;
        case 'sort':
          fieldData['options'] = item?.options || [];
          fieldData['type'] = 'sort';
          fieldData['title'] = item?.title || '';
          fieldData['description'] = item?.description || '';
          fieldData['numberingStyle'] = item?.numberingStyle || 'none';
          break;
        case 'none':
          fieldData['type'] = 'none';
          fieldData['image'] = item?.image || '';
          fieldData['imageAlt'] = item?.imageAlt || '';
          fieldData['imageDescription'] = item?.imageDescription || '';
          fieldData['infoBlockStyle'] = item?.infoBlockStyle || 'default';
          fieldData['infoBlockShareButton'] =
            item?.infoBlockShareButton || false;
          fieldData['infoBlockExtraButtonTitle'] =
            item?.infoBlockExtraButtonTitle || '';
          fieldData['infoBlockExtraButton'] = item?.infoBlockExtraButton || '';
          fieldData['createImageSlider'] = item?.createImageSlider || false;
          fieldData['imageClickable'] = item?.imageClickable || false;
          fieldData['images'] = item?.images || [];
          break;
        case 'swipe':
          fieldData['type'] = 'swipe';
          fieldData['required'] = item?.fieldRequired || false;
          fieldData['cards'] = item?.options?.map((card) => {
            return {
              id: card.trigger,
              title: card.titles[0].key,
              infoField: card.titles[0].infoField,
              image: card.titles[0].image || '',
              explanationRequired: card.titles[0].explanationRequired || false,
            };
          });
          // The swipe component usually manages its own state, but if it supports
          // an initial selection prop, we can pass draftValue through defaultValue.
          if (draftValue !== undefined) {
            fieldData['defaultValue'] = draftValue;
          }
          break;
        case 'dilemma':
          fieldData['type'] = 'dilemma';
          fieldData['title'] = item?.title || '';
          fieldData['required'] = item?.fieldRequired || false;
          fieldData['infoField'] = item?.infoField || '';
          fieldData['infofieldExplanation'] =
            item?.infofieldExplanation || false;
          fieldData['dilemmas'] = item?.options?.map((dilemmaOption) => {
            return {
              id: dilemmaOption.trigger,
              infoField: dilemmaOption.titles[0].infoField || '',
              infofieldExplanation:
                dilemmaOption.titles[0].infofieldExplanation || false,
              a: {
                title: dilemmaOption.titles[0].key,
                description: dilemmaOption.titles[0].description || '',
                image: dilemmaOption.titles[0].image || '',
              },
              b: {
                title: dilemmaOption.titles[0].key_b || '',
                description: dilemmaOption.titles[0].description_b || '',
                image: dilemmaOption.titles[0].image_b || '',
              },
            };
          });
          break;
        case 'video':
          fieldData['type'] = 'video';
          fieldData['videoUrl'] = item?.videoUrl || '';
          fieldData['videoSubtitle'] = item?.videoSubtitle;
          fieldData['videoLang'] = item?.videoLang;
          break;
        case 'matrix':
          fieldData['type'] = 'matrix';
          fieldData['matrix'] = item?.matrix || undefined;
          fieldData['matrixMultiple'] = item?.matrixMultiple || false;
          fieldData['defaultValue'] =
            draftValue !== undefined ? draftValue : [];
          break;
      }

      formFields.push(fieldData);
    }
  }

  const initialValues: { [p: string]: FormValue } = {};
  if (savedDraft) {
    for (const [key, value] of Object.entries(savedDraft)) {
      if (value !== undefined && value !== null && value !== '') {
        initialValues[key] = value;
      }
    }
  }

  const totalFieldCount =
    props.items?.filter((item) => item.questionType !== 'pagination').length ||
    0;

  const [currentPage, setCurrentPage] = useState<number>(0);

  const totalPages =
    formFields.filter((field) => field.type === 'pagination').length + 1 || 1;
  // Find indices of all pagination fields
  const paginationFieldPositions = formFields
    .map((field, idx) => (field.type === 'pagination' ? idx : -1))
    .filter((idx) => idx !== -1);

  // Add start and end indices for slicing
  const pageFieldStartPositions = [
    0,
    ...paginationFieldPositions.map((idx) => idx + 1),
  ];
  const pageFieldEndPositions = [
    ...paginationFieldPositions,
    formFields.length,
  ];

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Positional question_id map (qid1..qidN) based on the question order.
  const questionIdMap = buildQuestionIdMap(props.items);

  const getTrackingContext = () => ({
    environment: detectEnvironment(props.gtmEnvironment),
    formId: `fid${props.widgetId || '0'}`,
    formName: props.title || '',
    displayType: (isFullscreen ? 'fullscreen' : 'standard') as DisplayType,
    memberId: (currentUser as any)?.id
      ? String((currentUser as any).id)
      : undefined,
  });

  const getStepInfo = (pageIndex: number) => {
    const status: FormStatus =
      pageIndex === 0
        ? 'started'
        : pageIndex >= totalPages - 1
          ? 'final_step'
          : 'in_progress';

    // Dedicated, stable step name: the pagination item that introduces a
    // page carries the name of that next page (page 1 = the
    // pagination before page 1, etc.). Falls back to "Stap N" when no
    // name is set, so the name does not move along with the first question.
    const paginationFields = formFields.filter((f) => f.type === 'pagination');
    const configuredName =
      pageIndex > 0
        ? (paginationFields[pageIndex - 1] as any)?.stepName
        : undefined;
    const formStepName =
      (typeof configuredName === 'string' && configuredName.trim()) ||
      `Stap ${pageIndex + 1}`;

    return {
      formStep: pageIndex + 1,
      formStepName,
      formStepTotal: totalPages,
      formStatus: status,
    };
  };

  // Fires form_start once and then the form_step of the current page,
  // so form_step comes together with form_start (not on load).
  const ensureFormStarted = () => {
    if (formStartFiredRef.current) return;
    formStartFiredRef.current = true;
    pushFormStart(getTrackingContext());
    pushFormStep({ ...getTrackingContext(), ...getStepInfo(currentPage) });
  };

  useEffect(() => {
    if (!draftChecked) return;

    // The first run is loading page 1; we skip that form_step.
    if (!stepMountSkippedRef.current) {
      stepMountSkippedRef.current = true;
      return;
    }

    // Navigation to a next step. Should the user navigate without
    // interaction, we still start the form here (form_start first).
    if (!formStartFiredRef.current) {
      ensureFormStarted();
      return;
    }
    pushFormStep({ ...getTrackingContext(), ...getStepInfo(currentPage) });
  }, [currentPage, draftChecked]);

  const handleFieldInteraction = (interactionKey: string) => {
    // form_start (+ form_step of the current page) fires on the first real
    // user interaction, before the first question_interact event.
    ensureFormStarted();

    if (interactedFieldsRef.current.has(interactionKey)) return;
    interactedFieldsRef.current.add(interactionKey);

    const { baseKey, questionId, isExplanation } = resolveQuestionId(
      questionIdMap,
      interactionKey
    );

    const item = props.items?.find((i) => i.fieldKey === baseKey);
    if (
      !item ||
      !questionId ||
      item.questionType === 'pagination' ||
      item.questionType === 'none'
    )
      return;

    pushQuestionInteract({
      ...getTrackingContext(),
      ...getStepInfo(currentPage),
      questionId,
      questionName: isExplanation
        ? `${item.title || ''} (explanation)`
        : item.title || '',
      questionType: mapQuestionType(item.questionType || '', item.showSmileys),
    });
  };

  const handleValidationErrors = (
    errors: Array<{ fieldKey: string; errorMessage: string | null }>
  ) => {
    const context = getTrackingContext();
    const stepInfo = getStepInfo(currentPage);

    errors.forEach(({ fieldKey, errorMessage }) => {
      const item = props.items?.find((i) => i.fieldKey === fieldKey);

      pushFormError({
        ...context,
        ...stepInfo,
        questionId: item
          ? questionIdMap[fieldKey] || context.formId
          : context.formId,
        questionName: item?.title || context.formName,
        questionType: item
          ? mapQuestionType(item.questionType || '', item.showSmileys)
          : 'form_error',
        formErrorText: errorMessage || 'Validation error',
        formErrorType: errorMessage?.toLowerCase().includes('verplicht')
          ? 'required_field'
          : 'invalid_input',
      });
    });
  };

  const handleValuesChange = (values: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;

    // form_start has been moved to handleFieldInteraction so it only fires on
    // a real user interaction, not on the mount initialisation.

    if (props.enableDraftPersistence !== true) return;

    latestValuesRef.current = values;

    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    const pathname = window.location.pathname;
    const storageKey = getStorageKey(props.projectId, props.widgetId, pathname);
    const delay = 750; // ms debounce between saves

    saveTimeoutRef.current = window.setTimeout(() => {
      if (latestValuesRef.current) {
        saveDraft(storageKey, latestValuesRef.current);
      }
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`osc${isFullscreen ? ' --fullscreen' : ''}`}
      data-form-name={props.title || ''}>
      <div className="container">
        {formOnlyVisibleForUsers && !hasRole(currentUser, 'member') && (
          <>
            <Banner className="big">
              <Heading6>Inloggen om deel te nemen.</Heading6>
              <Spacer size={1} />
              <Button
                type="button"
                onClick={() => {
                  document.location.href = props.login?.url || '';
                }}>
                Inloggen
              </Button>
            </Banner>
            <Spacer size={2} />
          </>
        )}
        {props.formStyle === 'youth' && (
          <div className="youth-form-actions">
            <button
              type="button"
              className="youth-fullscreen-btn"
              onClick={() => {
                // Detecteer iOS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (isIOS) {
                  setIsFullscreen(!isFullscreen);
                  // Alleen styling togglen, geen native fullscreen API
                } else {
                  if (document.fullscreenElement) {
                    setIsFullscreen(false);
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    }
                  } else {
                    setIsFullscreen(true);
                    if (document.documentElement.requestFullscreen) {
                      document.documentElement.requestFullscreen();
                    }
                  }
                }
              }}>
              {isFullscreen ? (
                <i className="ri-close-line"></i>
              ) : (
                <i className="ri-fullscreen-line"></i>
              )}
              <span>
                {isFullscreen
                  ? 'Verlaat volledig scherm'
                  : 'Bekijk in volledig scherm'}
              </span>
            </button>
          </div>
        )}

        <div className={`osc-enquete-item-content --${props.formStyle}`}>
          {props.displayTitle && props.title && (
            <RteContent
              content={props.title}
              inlineComponent={Heading2}
              unwrapSingleRootDiv={true}
            />
          )}
          <div className="osc-enquete-item-description">
            {props.displayDescription && props.description && (
              <RteContent
                content={props.description}
                unwrapSingleRootDiv={true}
              />
            )}
          </div>
          {draftChecked && (
            <Form
              {...props}
              fields={formFields}
              formStyle={props.formStyle || 'default'}
              getValuesOnChange={handleValuesChange}
              submitDisabled={
                !hasRole(currentUser, 'member') && formOnlyVisibleForUsers
              }
              submitHandler={onSubmit}
              submitText="Versturen"
              title=""
              currentPage={currentPage}
              pageFieldEndPositions={pageFieldEndPositions}
              pageFieldStartPositions={pageFieldStartPositions}
              prevPage={currentPage > 0 ? currentPage - 1 : null}
              prevPageText="Vorige"
              setCurrentPage={setCurrentPage}
              totalFieldCount={totalFieldCount}
              totalPages={totalPages}
              initialValues={initialValues}
              onFieldInteraction={handleFieldInteraction}
              onValidationErrors={handleValidationErrors}
            />
          )}
        </div>

        <NotificationProvider />
      </div>
    </div>
  );
}

Enquete.loadWidget = loadWidget;
export { Enquete };
