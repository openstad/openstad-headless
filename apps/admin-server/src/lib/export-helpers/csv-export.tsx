export const exportDataToCSV = (data: any, widgetName: string, selectedWidget: any) => {

  console.log( "selectedWidget?.config?.items", selectedWidget?.config?.items );

  if ( selectedWidget && selectedWidget?.config && selectedWidget?.config?.items ) {

    const fieldKeyToTitleMap = selectedWidget?.config?.items.reduce((acc: any, item: any) => {
      acc[item.fieldKey] = item.title;
      return acc;
    }, {});

    data = data.map((row: any) => {
      const updatedSubmittedData = Object.keys(row?.submittedData).reduce((acc: any, key: any) => {
        const newKey = fieldKeyToTitleMap[key] || key;
        acc[newKey] = row?.submittedData[key];
        return acc;
      }, {});

      return {
        ...row,
        submittedData: updatedSubmittedData
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
          return [...parsedValue].join(' | ')
        }

    return value;
  };

  const createRow = (rowData: any, keys: any) => {
    const rowValues = keys.map((key: any) => {
      return normalizeData(rowData[key]);
    });

    return rowValues.join(';');
  };

  const fixedColumns = ['ID', 'Aangemaakt op', 'Project ID', 'Widget', 'Gebruikers ID'];

  let dynamicColumns: string[] = [];

  if (selectedWidget?.config?.items?.length > 0) {
    dynamicColumns = selectedWidget.config.items.map((item: any) => item.title || item.fieldKey);
  }

  const allSubmittedKeys = new Set<string>();
  data.forEach((row: any) => {
    if (row?.submittedData) {
      Object.keys(row.submittedData).forEach(key => {
        const title = selectedWidget?.config?.items?.find((item: any) => item.fieldKey === key)?.title || key;
        allSubmittedKeys.add(title);
      });
    }
  });

  const extraDynamicColumns = Array.from(allSubmittedKeys).filter(key => !dynamicColumns.includes(key));

  const columns = [...fixedColumns, ...dynamicColumns, ...extraDynamicColumns];

  const headerRow = [...columns].join(';');

  const dataRows = data.map((row: any) => {
    const rowData = {
      ID: row.id || ' ',
      'Aangemaakt op': row.createdAt || ' ',
      'Project ID': row.projectId || ' ',
      'Widget': widgetName || ' ',
      'Gebruikers ID': row.userId || ' ',
      ...Object.fromEntries(
        Object.entries(row.submittedData).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const flattenedValue = Object.entries(value)
              .map(([subKey, subValue]) => `${subKey}: ${subValue.url || subValue}`)
              .join(', ');
            return [key, flattenedValue];
          } else {
            return [key, JSON.stringify(value)];
          }
        })
      ),
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
