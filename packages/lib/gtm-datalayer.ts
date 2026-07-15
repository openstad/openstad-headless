declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type GtmEnvironment = 'prod' | 'acc' | 'test';
export type DisplayType = 'fullscreen' | 'standard';
export type FormStatus = 'started' | 'in_progress' | 'final_step';
export type FormErrorType = 'required_field' | 'invalid_input';
export type QuestionType =
  | 'textbox'
  | 'select_single'
  | 'select_multiple'
  | 'number_slider'
  | 'emoji_slider'
  | 'keuzeswipe'
  | 'beeldkiezer'
  | string;

type BaseParams = {
  environment: GtmEnvironment;
  formId: string;
  formName: string;
  displayType: DisplayType;
  memberId?: string;
};

type StepParams = {
  formStep: number;
  formStepName: string;
  formStepTotal: number;
  formStatus: FormStatus;
};

export type FormStartParams = BaseParams;

export type FormStepParams = BaseParams & StepParams;

export type FormSubmitParams = BaseParams;

export type QuestionInteractParams = BaseParams &
  StepParams & {
    questionId: string;
    questionName: string;
    questionType: QuestionType;
  };

export type FormErrorParams = BaseParams &
  StepParams & {
    questionId: string;
    questionName: string;
    questionType: string;
    formErrorText: string;
    formErrorType: FormErrorType;
  };

function stripHtml(input: string): string {
  let previous: string;
  do {
    previous = input;
    input = input.replace(/<[^>]*>?/gm, '');
  } while (input !== previous);
  return input.trim();
}

function pushToDataLayer(event: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

function buildBase(params: BaseParams): Record<string, unknown> {
  const obj: Record<string, unknown> = {
    environment: params.environment,
    form_provider: 'openstad',
    form_id: params.formId,
    form_name: stripHtml(params.formName),
    display_type: params.displayType,
  };
  if (params.memberId) {
    obj.member_id = params.memberId;
  }
  return obj;
}

function buildStep(params: StepParams): Record<string, unknown> {
  return {
    form_step: params.formStep,
    form_step_name: stripHtml(params.formStepName),
    form_step_total: params.formStepTotal,
    form_status: params.formStatus,
  };
}

export function detectEnvironment(override?: string): GtmEnvironment {
  if (override === 'prod' || override === 'acc' || override === 'test') {
    return override;
  }
  return 'prod';
}

const questionTypeMap: Record<string, QuestionType> = {
  open: 'textbox',
  multiplechoice: 'select_single',
  multiple: 'select_multiple',
  swipe: 'keuzeswipe',
  images: 'beeldkiezer',
};

export function mapQuestionType(
  questionType: string,
  showSmileys?: boolean
): QuestionType {
  if (questionType === 'scale') {
    return showSmileys ? 'emoji_slider' : 'number_slider';
  }
  return questionTypeMap[questionType] || questionType;
}

export function pushFormStart(params: FormStartParams): void {
  pushToDataLayer({ event: 'form_start', ...buildBase(params) });
}

export function pushFormStep(params: FormStepParams): void {
  pushToDataLayer({
    event: 'form_step',
    ...buildBase(params),
    ...buildStep(params),
  });
}

export function pushFormSubmit(params: FormSubmitParams): void {
  pushToDataLayer({ event: 'form_submit', ...buildBase(params) });
}

export function pushQuestionInteract(params: QuestionInteractParams): void {
  pushToDataLayer({
    event: 'question_interact',
    ...buildBase(params),
    ...buildStep(params),
    question_id: params.questionId,
    question_name: stripHtml(params.questionName),
    question_type: params.questionType,
  });
}

export function pushFormError(params: FormErrorParams): void {
  pushToDataLayer({
    event: 'form_error',
    ...buildBase(params),
    ...buildStep(params),
    question_id: params.questionId,
    question_name: stripHtml(params.questionName),
    question_type: params.questionType,
    form_error_text: params.formErrorText,
    form_error_type: params.formErrorType,
  });
}
