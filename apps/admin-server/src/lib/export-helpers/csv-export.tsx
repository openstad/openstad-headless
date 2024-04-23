export const exportDataToCSV = (data, fileName, widgetName) => {
  const normalizeData = (value) => {
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

  const createRow = (rowData, keys) => {
    const rowValues = keys.map((key) => {
      return normalizeData(rowData[key]);
    });

    return rowValues.join(';');
  };

  const allKeys = data.reduce(
    (acc, curr) => [...acc, ...Object.keys(curr.submittedData)],
    ['ID', 'Aangemaakt op', 'Project ID', 'Widget', 'Gebruikers ID']
  );
  const columns = Array.from(new Set(allKeys));

  const headerRow = [...columns].join(';');

  const dataRows = data.map((row) => {
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
