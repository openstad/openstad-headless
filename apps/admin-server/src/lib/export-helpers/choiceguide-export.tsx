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

    const fieldKeyToTitleMap = items.reduce((acc: any, item: any, index: number) => {
      if (item.type === 'none') {
        return acc;
      }

      let title = item.title || `Item ${index + 1}`;

      if (item.type === 'a-b-slider') {
        const explanationA = item.explanationA || 'A';
        const explanationB = item.explanationB || 'B';
        title = `${title}   ${explanationA} - ${explanationB}`;
      }

      const newKey = item.type + '-' + (index + 1);

      acc[newKey] = title;
      return acc;
    }, {});

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

      const updatedResult = Object.keys(row?.result || {}).reduce((acc: any, key: any) => {
        const newKey = fieldKeyToTitleMap[key] || key;
        acc[newKey] = row?.result[key];
        return acc;
      }, {});

      Object.keys(scores).forEach((key: any) => {
        updatedResult[`Score: ${key}`] = scores[key];
      });

      return {
        ...row,
        result: updatedResult
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

  const createRow = (rowData: any, keys: any) => {
    const rowValues = keys.map((key: any) => {
      return normalizeData(rowData[key]);
    });

    return rowValues.join(';');
  };

  const allKeys = data.reduce(
    (acc: any, curr: any) => {
      const filteredKeys = Object.keys(curr.result).filter(key => !key.includes('none'));
      return [...acc, ...filteredKeys];
    },
    ['ID', 'Aangemaakt op', 'Project ID', 'Widget', 'Gebruikers ID']
  );
  const columns = Array.from(new Set(allKeys));

  const headerRow = [...columns].join(';');

  const dataRows = data.map((row: any) => {
    const filteredResult = Object.keys(row.result)
        .filter(key => !key.includes('none'))
        .reduce((acc: any, key) => {
          acc[key] = row.result[key];
          return acc;
        }, {});

    const rowData= {
      ID: row.id,
      'Aangemaakt op' : row.createdAt,
      'Project ID' : row.projectId,
      'Widget' : widgetName,
      'Gebruikers ID' : row.userId,
      ...filteredResult,
    };

    return createRow(rowData, columns);
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
