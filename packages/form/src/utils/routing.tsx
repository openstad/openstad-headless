import type { FieldWithOptionalFields } from "../props";
import type { FormValue } from "../form";

type ExtendedFormValue = FormValue | string[];

type RoutingFunction = {
  fields: Array<FieldWithOptionalFields>,
  initialFormValues: { [key: string]: FormValue },
  routingHiddenFields: string[],
  setFormValues: React.Dispatch<React.SetStateAction<{ [key: string]: FormValue, }>>,
  setRoutingHiddenFields: React.Dispatch<React.SetStateAction<string[]>>,
  formValues: { [key: string]: FormValue }
};

export const updateRouting = ({
  fields,
  initialFormValues,
  routingHiddenFields,
  setFormValues,
  setRoutingHiddenFields,
  formValues
}: RoutingFunction) => {
  const hiddenFields: Array<string> = [];
  const updateValues: { [key: string]: FormValue } = {};

  fields.forEach((field: FieldWithOptionalFields) => {
    if (
      !field?.routingInitiallyHide || !field.routingSelectedQuestion || !field.routingSelectedAnswer
    ) return;

    const fieldKeyFromFieldToHide = field.fieldKey || '';
    if (hiddenFields.includes(fieldKeyFromFieldToHide)) return;

    const fieldToCheck = fields.find((f: FieldWithOptionalFields ) => f?.trigger === field.routingSelectedQuestion);
    const fieldKey = fieldToCheck?.fieldKey || '';
    const fieldHasValue = fieldToCheck && typeof(formValues[fieldKey]) !== 'undefined';

    if (!fieldHasValue) return;

    let answer: ExtendedFormValue = formValues[fieldKey] || '';
    if ( typeof(answer) === 'string' && answer.match(/^\[.*]$/) ) {
      try {
        const parsedAnswer = JSON.parse(answer);

        if (Array.isArray(parsedAnswer)) {
          answer = parsedAnswer;
        }
      } catch (e) {}
    }

    const fieldChoices = (fieldToCheck as any)?.choices || [];

    type choiceType = { trigger: string, value: string };
    const selectedOption: choiceType = fieldChoices.find((choice: choiceType) => choice.trigger === field.routingSelectedAnswer);
    const selectedOptionValue = selectedOption ? selectedOption.value : null;

    // This may seem a bit complex, but this way all the TypeScript warnings are gone
    if (
      Array.isArray(answer) &&
      answer.length > 0 &&
      selectedOption &&
      selectedOptionValue !== null &&
      (answer as string[]).includes(selectedOptionValue)
    ) {
      return;
    } else if ( !Array.isArray(answer) && answer === selectedOptionValue ) {
      return;
    } else {
      hiddenFields.push(fieldKeyFromFieldToHide);
      const fieldDefaultValue = typeof initialFormValues[fieldKeyFromFieldToHide] !== 'undefined' ? initialFormValues[fieldKeyFromFieldToHide] : '';

      if (typeof formValues[fieldKeyFromFieldToHide] !== 'undefined' && formValues[fieldKeyFromFieldToHide] !== fieldDefaultValue) {
        updateValues[fieldKeyFromFieldToHide] = fieldDefaultValue;
      }
    }
  });

  if (Object.keys(updateValues).length > 0) {
    setFormValues((prevFormValues) => ({ ...prevFormValues, ...updateValues }));
  }

  const hiddenFieldsChanged = hiddenFields.length !== routingHiddenFields.length || hiddenFields.some(field => !routingHiddenFields.includes(field));
  if (hiddenFieldsChanged) {
    setRoutingHiddenFields(hiddenFields);
  }
}