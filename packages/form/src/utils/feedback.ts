export type OptionState = 'correct' | 'incorrect' | 'missed';

export type FeedbackResult = {
  isFullyCorrect: boolean;
  textToShow: string[];
  optionStates: Record<string, OptionState>;
};

export type FeedbackField = {
  type?: string;
  feedbackMode?: 'none' | 'static' | 'perAnswer' | 'correctIncorrect';
  feedbackText?: string;
  feedbackCorrect?: string;
  feedbackIncorrect?: string;
  scaleFeedback?: string[];
  choices?: Array<{
    value: string;
    label?: string;
    isCorrect?: boolean;
    feedbackText?: string;
  }>;
};

const emptyResult: FeedbackResult = {
  isFullyCorrect: false,
  textToShow: [],
  optionStates: {},
};

function parseSelectedValues(
  field: FeedbackField,
  rawValue: unknown
): string[] {
  if (field.type === 'checkbox') {
    if (Array.isArray(rawValue)) {
      return rawValue.map((value) => String(value));
    }
    if (typeof rawValue === 'string' && rawValue !== '') {
      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
          return parsed.map((value) => String(value));
        }
      } catch {
        return [];
      }
    }
    return [];
  }

  return rawValue && rawValue !== '' ? [String(rawValue)] : [];
}

export function evaluateFeedback(
  field: FeedbackField,
  rawValue: unknown
): FeedbackResult {
  const mode = field.feedbackMode;

  if (!mode || mode === 'none') {
    return { isFullyCorrect: false, textToShow: [], optionStates: {} };
  }

  if (mode === 'static') {
    return {
      isFullyCorrect: false,
      textToShow: field.feedbackText ? [field.feedbackText] : [],
      optionStates: {},
    };
  }

  const selected = parseSelectedValues(field, rawValue);

  if (selected.length === 0) {
    return { isFullyCorrect: false, textToShow: [], optionStates: {} };
  }

  const choices = field.choices || [];

  if (mode === 'correctIncorrect') {
    const correctValues = choices
      .filter((choice) => choice.isCorrect === true)
      .map((choice) => choice.value);

    const selectedSet = new Set(selected);
    const correctSet = new Set(correctValues);
    const isFullyCorrect =
      selectedSet.size === correctSet.size &&
      Array.from(selectedSet).every((value) => correctSet.has(value));

    const optionStates: Record<string, OptionState> = {};
    for (const value of selected) {
      const choice = choices.find((item) => item.value === value);
      optionStates[value] =
        choice?.isCorrect === true ? 'correct' : 'incorrect';
    }

    if (!isFullyCorrect) {
      for (const choice of choices) {
        if (choice.isCorrect === true && !selectedSet.has(choice.value)) {
          optionStates[choice.value] = 'missed';
        }
      }
    }

    const text = isFullyCorrect
      ? field.feedbackCorrect
      : field.feedbackIncorrect;

    return {
      isFullyCorrect,
      textToShow: text ? [text] : [],
      optionStates,
    };
  }

  if (mode === 'perAnswer') {
    if (field.type === 'tickmark-slider') {
      const index = Number(rawValue) - 1;
      const entry =
        index >= 0 && index < (field.scaleFeedback?.length || 0)
          ? field.scaleFeedback?.[index]
          : undefined;

      return {
        isFullyCorrect: false,
        textToShow: entry ? [entry] : [],
        optionStates: {},
      };
    }

    const selectedSet = new Set(selected);
    const textToShow = choices
      .filter((choice) => selectedSet.has(choice.value) && choice.feedbackText)
      .map((choice) => choice.feedbackText as string);

    return {
      isFullyCorrect: false,
      textToShow,
      optionStates: {},
    };
  }

  return { ...emptyResult };
}
