import * as XLSX from "xlsx";
import { fetchMatrixData } from "./fetch-matrix-data";

export const exportSubmissionsToCSV = (data: any, widgetName: string, selectedWidget: any) => {
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

  const fileName = transformString() + '.xlsx';

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

      return `${escapedValue}`;
    }

    return value;
  };

  const fieldKeyToTitleMap = new Map();

  if (selectedWidget?.config?.items?.length > 0) {
    selectedWidget.config.items.forEach((item: any) => {
      if (item.questionType === 'none' && selectedWidget?.type !== "distributionmodule") return;

      const title = item.title || item.fieldKey;
      if (item.questionType === 'matrix') {
        item.matrix?.rows?.forEach((row: any) => {
          const matrixKey = `matrix_${item.fieldKey}_${row.trigger}`;
          fieldKeyToTitleMap.set(matrixKey, `${title}: ${row.text}`);
        });
      } else if (title) {
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
              fieldKeyToTitleMap.set(otherKey, otherTitle);
            }
          }
        });
      }
    });
  }

  const rows = data.map((row: any) => {
    const rowData: Record<string, any> = {
      'ID': row.id || ' ',
      'Aangemaakt op': row.createdAt || ' ',
      'Project ID': row.projectId || ' ',
      'Widget': widgetName || ' ',
      'Gebruikers ID': row.userId || ' ',
      'Gebruikers rol': row.user?.role || ' ',
      'Gebruikers naam': row.user?.name || ' ',
      'Gebruikers weergavenaam': row.user?.displayName || ' ',
      'Gebruikers e-mailadres': row.user?.email || ' ',
      'Gebruikers telefoonnummer': row.user?.phonenumber || ' ',
      'Gebruikers adres': row.user?.address || ' ',
      'Gebruikers woonplaats': row.user?.city || ' ',
      'Gebruikers postcode': row.user?.postcode || ' ',
    };

    const keyCount: Record<string, number> = {};
    Array.from(fieldKeyToTitleMap.entries()).forEach(([key, title]) => {
      let rawValue = row.submittedData?.[key];

      if (key?.startsWith('matrix')) {
        rawValue = fetchMatrixData(key, selectedWidget?.config?.items, row?.submittedData || [], false) || '';
      }

      const baseKey = title;
      const keyHeader = keyCount[baseKey]
        ? `${baseKey} (${keyCount[baseKey]++})`
        : (keyCount[baseKey] = 1, baseKey);

      rowData[keyHeader] = normalizeData(rawValue);
    });
    if (selectedWidget?.type !== "distributionmodule") {
      rowData['Embedded URL'] = row?.submittedData?.embeddedUrl || '';
    }
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
  XLSX.writeFile(workbook, fileName);
};