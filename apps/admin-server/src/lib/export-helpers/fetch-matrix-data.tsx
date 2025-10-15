export const fetchMatrixData = (key: string, allItems: any, results: any, isChoiceGuide = true) => {
  const parts = key.split('_');

  if (parts.length !== 2 && isChoiceGuide) {
    return null;
  }

  const resultKey = parts[0];
  let item = null;
  let fieldKey = '';

  if (isChoiceGuide) {
    const itemParts = resultKey.split('-');
    if (itemParts.length !== 2) {
      return null;
    }

    const itemTrigger = itemParts[1];

    item = allItems.find((i: any) => i.type === 'matrix' && i.trigger === itemTrigger);
  } else {
    fieldKey = key.replace('matrix_', '');

    const fieldKeyParts = fieldKey.split('_');

    if (fieldKeyParts.length < 2) {
      return null;
    }

    fieldKeyParts.pop();
    fieldKey = fieldKeyParts.join('_');

    item = allItems.find((i: any) => i.questionType === 'matrix' && i.fieldKey === fieldKey);
  }

  const rowTrigger = isChoiceGuide ? parts[1] : key.split('_').pop();

  const answers = item?.matrix?.columns || [];

  const resultRowKey = isChoiceGuide ? resultKey : fieldKey;
  const resultRow = results?.[resultRowKey] || '';
  if (!resultRow) {
    return null;
  }

  const allResults = resultRow?.filter((r: string) => {
    const resParts = r.split('_');
    return resParts.length === 2 && resParts[0] === rowTrigger;
  }) || [];

  const returnValue = allResults.length > 0 ? allResults.reduce((acc: string[], res: string) => {
    const resParts = res.split('_');

    const returnValue = answers.find((a: any) => a.trigger === resParts[1])?.text || null;
    if (returnValue) {
      acc.push(returnValue);
    }
    return acc;

  }, []) : null;

  return returnValue ? JSON.stringify(returnValue) : null;
}