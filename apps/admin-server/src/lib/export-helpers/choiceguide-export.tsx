import {calculateScoreForItem} from "../../../../../packages/choiceguide/src/parts/scoreUtils";
import {InitializeWeights} from "../../../../../packages/choiceguide/src/parts/init-weights";

export const exportChoiceGuideToCSV = (data: any, widgetName: string, selectedWidget: any) => {
  if (selectedWidget && selectedWidget?.config && selectedWidget?.config?.items) {

    const items = selectedWidget?.config?.items || [];
    const choiceOptions = selectedWidget?.config?.choiceOption?.choiceOptions || [];
    const choiceType = selectedWidget?.config?.choicesType || 'default';

    let weights: any = {};
    try {
      weights = InitializeWeights(items, choiceOptions);
    } catch (error) {
      weights = {};
    }

    const fieldKeyToTitleMap = new Map();
    items.forEach((item: any) => {
      if (item.type === 'none') {
        return;
      }

      let title = item.title || item.description;

      if (item.type === 'a-b-slider') {
        const explanationA = item.explanationA || 'A';
        const explanationB = item.explanationB || 'B';
        title = `${title}   ${explanationA} - ${explanationB}`;
      }

      const newKey = item.type + '-' + item.trigger;

      fieldKeyToTitleMap.set(newKey, title);

      if (item.options && Array.isArray(item.options) && item.options.length > 0) {
        item.options.forEach((option: {titles: [{key?: string, title?: string, isOtherOption?: boolean}], trigger: string}) => {
          if (!!option.titles && Array.isArray(option.titles) && option.titles.length > 0 && option.titles[0].isOtherOption) {
            const otherTitle = `${option.titles[0].key || option.titles[0].title || 'Anders, namelijk'}`;
            const otherKey = `${newKey}_${option.trigger}_other`;

            fieldKeyToTitleMap.set(otherKey, otherTitle);
          }
        });
      }

    });

    data = data.map((row: any) => {
      const scores: { [key: string]: any } = {};

      choiceOptions.forEach((choiceOption: any) => {
        try {
          const calculatedScores = calculateScoreForItem(choiceOption, row?.result || {}, weights, choiceType);
          scores[choiceOption.title] = calculatedScores.x ? (calculatedScores.x).toFixed(0) : 0;
        } catch (error) {
          scores[choiceOption.title] = 0;
        }
      });

      const rowMap = new Map();
      fieldKeyToTitleMap.forEach((value, key) => {
        const index = Array.from(fieldKeyToTitleMap.keys()).indexOf(key);

        if (row?.result && row?.result[key]) {
          rowMap.set(index, {'result': row?.result[key], 'value': value });
        } else {
          rowMap.set(index, {'result': '-', 'value': value});
        }
      });

      Object.keys(scores).forEach((key: any) => {
        const index = rowMap.size;
        rowMap.set(index, {'result': scores[key], 'value': `Score: ${key}` });
      });

      return {
        ...row,
        result: Object.fromEntries(rowMap)
      };
    });
  }

  function transformString() {
    widgetName = widgetName.replace(/\s+/g, '-').toLowerCase();
    widgetName = widgetName.replace(/[^a-z0-9-]/g, '');
    widgetName = widgetName.replace(/-+/g, '-');

    const currentDate = new Date().toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');

    return `export-${widgetName}-${currentDate}`;
  }

  const fileName = transformString();

  const normalizeData = (value: any) => {
    let parsedValue;

    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      return value;
    }

    if (Array.isArray(parsedValue)) {
      return [...parsedValue].join(', ')
    }

    return value;
  };

  const headerRow = [
    'ID',
    'Aangemaakt op',
    'Project ID',
    'Widget',
    'Gebruikers ID',
    ...Object.values(data[0].result).map((item: any) => item.value)
  ].join(';');

  const dataRows = data.map((row: any) => {
    return [
      row.id,
      row.createdAt,
      row.projectId,
      widgetName,
      row.userId,
      ...Object.values(row.result).map((item: any) => normalizeData(item.result))
    ].join(';');
  });

  const csv = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName + '.csv';
  a.click();

  window.URL.revokeObjectURL(url);
};
