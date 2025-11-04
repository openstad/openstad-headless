import * as XLSX from "xlsx";
import { fetchMatrixData } from "./fetch-matrix-data";
import { stripHtmlTags } from "@openstad-headless/lib/strip-html-tags";

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

  const normalizeData = (value: any, fieldType?: string) => {
    let parsedValue;

    try {
      parsedValue = JSON.parse(value);
    } catch (error) {}

    if (Array.isArray(parsedValue)) {
      return [...parsedValue].join(' | ')
    }

    if (typeof value === 'object' && fieldType === 'dilemma') {
      let optionText = value?.selectedOption === '0' ? 'Links' : value?.selectedOption;
      optionText = value?.selectedOption === '1' ? 'Rechts' : optionText;

      return value?.optionExplanation ? `${optionText}, Uitleg: ${value.optionExplanation}` : optionText;
    } else if (typeof value === 'object' && fieldType === 'swipe') {
      return Object.values(value).map((item: any) => {
        let returnText = '';
        if (item.title) returnText += `${item.title}: `;
        if (item.answer) returnText += `${item.answer} `;
        if (item.explanation) returnText += `, Uitleg: ${item.explanation}`;
        return returnText.trim();
      }).join(' | ');
    } else if (typeof value === 'object') {
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
      } else if (title && item.questionType !== 'pagination') {
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

    if ( process.env.NEXT_PUBLIC_HASH_IP_ADDRESSES === 'true' ) {
      rowData['Gebruikers IP-adres (gehasht)'] = row?.submittedData?.ipAddress || ' ';
    }

    const keyCount: Record<string, number> = {};
    Array.from(fieldKeyToTitleMap.entries()).forEach(([key, title]) => {
      let rawValue = row.submittedData?.[key];

      if (key?.startsWith('matrix')) {
        rawValue = fetchMatrixData(key, selectedWidget?.config?.items, row?.submittedData || [], false) || '';
      }

      const fieldType = (selectedWidget?.config?.items || []).find((item: any) => item.fieldKey === key)?.questionType;
      if (typeof rawValue === 'object' && fieldType === 'swipe') {
        Object.values(rawValue).map((item: any) => {
          let returnText = item.answer;
          if (item.explanation) returnText += `: ${item.explanation}`;

          let rowKeyHeaderTitle = item.title ? item.title : `Keuze ${item.cardId}`;
          rowKeyHeaderTitle = `${title}: ${rowKeyHeaderTitle}`;
          rowKeyHeaderTitle = rowKeyHeaderTitle && stripHtmlTags(rowKeyHeaderTitle);

          rowData[rowKeyHeaderTitle] = returnText.trim();
        });

        return;
      }

      const baseKey = title;
      let keyHeader = keyCount[baseKey]
        ? `${baseKey} (${keyCount[baseKey]++})`
        : (keyCount[baseKey] = 1, baseKey);

      keyHeader = keyHeader && stripHtmlTags(keyHeader);

      rowData[keyHeader] = normalizeData(rawValue, fieldType || '');
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