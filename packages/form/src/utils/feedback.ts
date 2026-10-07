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

export function isGraded(field: FeedbackField): boolean {
  return (
    Array.isArray(field.choices) &&
    field.choices.some((choice) => choice.isCorrect === true)
  );
}

export function evaluateFeedback(
  field: FeedbackField,
  rawValue: unknown
): FeedbackResult {
  const mode = field.feedbackMode;
  const choices = field.choices || [];
  const selected = parseSelectedValues(field, rawValue);

  const optionStates: Record<string, OptionState> = {};
  let isFullyCorrect = false;
  const textToShow: string[] = [];

  if (isGraded(field) && selected.length > 0) {
    const correctValues = choices
      .filter((choice) => choice.isCorrect === true)
      .map((choice) => choice.value);

    const selectedSet = new Set(selected);
    const correctSet = new Set(correctValues);
    isFullyCorrect =
      selectedSet.size === correctSet.size &&
      Array.from(selectedSet).every((value) => correctSet.has(value));

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

    const resultText = isFullyCorrect
      ? field.feedbackCorrect
      : field.feedbackIncorrect;
    if (resultText) {
      textToShow.push(resultText);
    }
  }

  if (mode === 'static') {
    if (field.feedbackText) {
      textToShow.push(field.feedbackText);
    }
  } else if (mode === 'perAnswer') {
    if (field.type === 'tickmark-slider') {
      const index = Number(rawValue) - 1;
      const entry =
        index >= 0 && index < (field.scaleFeedback?.length || 0)
          ? field.scaleFeedback?.[index]
          : undefined;
      if (entry) {
        textToShow.push(entry);
      }
    } else if (selected.length > 0) {
      const selectedSet = new Set(selected);
      for (const choice of choices) {
        if (selectedSet.has(choice.value) && choice.feedbackText) {
          textToShow.push(choice.feedbackText);
        }
      }
    }
  }

  return { isFullyCorrect, textToShow, optionStates };
}
