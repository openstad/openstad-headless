export const exportDataToCSV = (data: any, widgetName: string, selectedWidget: any) => {

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
        } catch (error) {}

        if (Array.isArray(parsedValue)) {
          return [...parsedValue].join(' | ')
        }

        if (typeof value === 'object') {
          if ( Array.isArray(value) && value.length > 0 ) {
            if ( typeof(value[0]) === 'object' ) {
              return value.map((item: any) => {
                return Object.entries(item)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(', ');
              }).join(' | ')
            }
          }

          return Object.entries(value)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
        }

        if ( typeof value === 'string' ) {
          let escapedValue = value.replace(/(\r\n|\r\r|\n\n|\n|\r)+/g, '\n');
          escapedValue = escapedValue.replace(/"/g, "'");

          return `"${escapedValue}"`;
        }

    return value;
  };

  const fixedColumns = ['ID', 'Aangemaakt op', 'Project ID', 'Widget', 'Gebruikers ID'];

  let dynamicColumns: string[] = [];
  const fieldKeyToTitleMap = new Map();

  if (selectedWidget?.config?.items?.length > 0) {
    selectedWidget.config.items.forEach((item: any) => {
      if (item.questionType === 'none' && selectedWidget?.type !== "distributionmodule") return;

      const title = item.title || item.fieldKey;
      if (title) {
        dynamicColumns.push(title);
        fieldKeyToTitleMap.set(item.fieldKey || title, title);
      }

      if (item.options && Array.isArray(item.options)) {
        item.options.forEach((option: any, index: number) => {
          const titles = option.titles;
          if (
            titles &&
            Array.isArray(titles) &&
            titles.length > 0 &&
            titles[0].isOtherOption
          ) {
            const otherKey = `${item.fieldKey}_${index}_other`;

            const hasOtherData = data.some((row: any) => !!row?.submittedData?.[otherKey]);

            const otherTitle = titles[0].key || titles[0].title || 'Anders, namelijk';
            if (hasOtherData && otherTitle) {
              dynamicColumns.push(otherTitle);
              fieldKeyToTitleMap.set(otherKey, otherTitle);
            }
          }
        });
      }
    });
  }

  const columns = [...fixedColumns, ...dynamicColumns];

  if (selectedWidget?.type !== "distributionmodule") {
    columns.push('Embedded URL');
  }

  const headerRow = [...columns].join(';');

  const dataRows = data.map((row: any) => {
    const rowData = [
      row.id || ' ',
      row.createdAt || ' ',
      row.projectId || ' ',
      widgetName || ' ',
      row.userId || ' ',
      ...Array.from(fieldKeyToTitleMap.entries()).map(([key, title]) => {
        const keyToUse = key?.endsWith('_other') ? key : title;
        const rawValue = row.submittedData?.[keyToUse];
        return normalizeData(rawValue);
      }),
    ];

    if (selectedWidget?.type !== "distributionmodule") {
      rowData.push(row?.submittedData?.embeddedUrl || '');
    }

    return rowData.join(';');
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
