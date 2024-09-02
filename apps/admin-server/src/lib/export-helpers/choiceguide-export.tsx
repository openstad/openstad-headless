export const exportChoiceGuideToCSV = (data: any, widgetName: string) => {

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
    (acc: any, curr: any) => [...acc, ...Object.keys(curr.result)],
    ['ID', 'Aangemaakt op', 'Project ID', 'Widget', 'Gebruikers ID']
  );
  const columns = Array.from(new Set(allKeys));

  const headerRow = [...columns].join(';');

  const dataRows = data.map((row: any) => {
    const rowData = {
      ID: row.id,
      'Aangemaakt op' : row.createdAt,
      'Project ID' : row.projectId,
      'Widget' : widgetName,
      'Gebruikers ID' : row.userId,
      ...row.submittedData,
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
