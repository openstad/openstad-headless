import type { FormValue } from '../form';
import type { FieldWithOptionalFields } from '../props';

type ExtendedFormValue = FormValue | string[];

type RoutingFunction = {
  fields: Array<FieldWithOptionalFields>;
  routingKeys: string[];
  initialFormValues: { [key: string]: FormValue };
  routingHiddenFields: string[];
  setFormValues: React.Dispatch<
    React.SetStateAction<{ [key: string]: FormValue }>
  >;
  setRoutingHiddenFields: React.Dispatch<React.SetStateAction<string[]>>;
  formValues: { [key: string]: FormValue };
};

export const updateRouting = ({
  fields,
  routingKeys,
  initialFormValues,
  routingHiddenFields,
  setFormValues,
  setRoutingHiddenFields,
  formValues,
}: RoutingFunction) => {
  const hiddenFields: Array<string> = [];
  const updateValues: { [key: string]: FormValue } = {};

  fields.forEach((field: FieldWithOptionalFields, index: number) => {
    if (
      !field?.routingInitiallyHide ||
      !field.routingSelectedQuestion ||
      !field.routingSelectedAnswer ||
      (Array.isArray(field.routingSelectedAnswer) &&
        field.routingSelectedAnswer.length === 0)
    )
      return;

    const fieldKeyFromFieldToHide = routingKeys[index] || '';
    if (hiddenFields.includes(fieldKeyFromFieldToHide)) return;

    const fieldToCheck = fields.find(
      (f: FieldWithOptionalFields) =>
        f?.trigger === field.routingSelectedQuestion
    );
    const fieldKey = fieldToCheck?.fieldKey || '';
    const fieldHasValue =
      fieldToCheck && typeof formValues[fieldKey] !== 'undefined';

    if (!fieldHasValue) return;

    let answer: ExtendedFormValue = formValues[fieldKey] || '';
    if (typeof answer === 'string' && answer.match(/^\[.*]$/)) {
      try {
        const parsedAnswer = JSON.parse(answer);

        if (Array.isArray(parsedAnswer)) {
          answer = parsedAnswer;
        }
      } catch (e) {}
    }

    const fieldChoices = (fieldToCheck as any)?.choices || [];

    type choiceType = { trigger: string; value: string };
    const selectedAnswerTriggers = Array.isArray(field.routingSelectedAnswer)
      ? field.routingSelectedAnswer
      : [field.routingSelectedAnswer];

    const selectedOptionValues: string[] = selectedAnswerTriggers
      .map((trigger) => {
        const option: choiceType = fieldChoices.find(
          (choice: choiceType) => choice.trigger === trigger
        );
        return option ? option.value : null;
      })
      .filter((value): value is string => value !== null);

    const answerMatchesAny =
      selectedOptionValues.length > 0 &&
      (Array.isArray(answer)
        ? answer.some((val) => selectedOptionValues.includes(val as string))
        : selectedOptionValues.includes(answer as string));

    if (answerMatchesAny) {
      return;
    } else {
      hiddenFields.push(fieldKeyFromFieldToHide);
      const fieldDefaultValue =
        typeof initialFormValues[fieldKeyFromFieldToHide] !== 'undefined'
          ? initialFormValues[fieldKeyFromFieldToHide]
          : '';

      if (
        typeof formValues[fieldKeyFromFieldToHide] !== 'undefined' &&
        formValues[fieldKeyFromFieldToHide] !== fieldDefaultValue
      ) {
        updateValues[fieldKeyFromFieldToHide] = fieldDefaultValue;
      }
    }
  });

  if (Object.keys(updateValues).length > 0) {
    setFormValues((prevFormValues) => ({ ...prevFormValues, ...updateValues }));
  }

  const hiddenFieldsChanged =
    hiddenFields.length !== routingHiddenFields.length ||
    hiddenFields.some((field) => !routingHiddenFields.includes(field));
  if (hiddenFieldsChanged) {
    setRoutingHiddenFields(hiddenFields);
  }
};
