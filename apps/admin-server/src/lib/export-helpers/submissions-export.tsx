import { stripHtmlTags } from '@openstad-headless/lib/strip-html-tags';
import type { ApiUser, ApiWidget, DynamicJson } from '@openstad-headless/types';
import * as XLSX from 'xlsx';

import { fetchMatrixData } from './fetch-matrix-data';
import { getRuntimeSpamFilterEnabled } from './get-runtime-spam-flag';
import { normalizeToArray } from './normalize-to-array';

// Form widget config item, as far as this export reads it.
type FormItemOption = {
  trigger?: string;
  value?: string;
  label?: string;
  titles?: { key?: string; title?: string; isOtherOption?: boolean }[];
};

type FormItem = {
  questionType?: string;
  fieldKey?: string;
  title?: string;
  matrix?: {
    rows?: { trigger: string; text?: string }[];
    columns?: { trigger: string; text?: string }[];
  };
  options?: FormItemOption[];
};

// Submission fields this export reads.
type SubmissionRow = {
  id?: string | number;
  createdAt?: string;
  projectId?: number | null;
  userId?: number | null;
  isSpam?: boolean;
  submittedData?: DynamicJson;
  // Known issue: the api returns `phoneNumber`, so `phonenumber` is always undefined and the export column stays empty.
  user?: (Partial<ApiUser> & { phonenumber?: string }) | null;
};

// Swipe / dilemma answer as stored in submittedData.
type ChoiceAnswer = {
  answer?: string;
  title?: string;
  explanation?: string;
  dilemmaId?: string | number;
  cardId?: string | number;
};

export interface ExportSettings {
  splitMultipleChoice: boolean;
}

export const exportSubmissionsToCSV = async (
  data: SubmissionRow[],
  widgetName: string,
  selectedWidget: ApiWidget | null | undefined,
  settings?: ExportSettings
) => {
  const includeSpamColumn = await getRuntimeSpamFilterEnabled();
  const includeHashedIpColumn = data?.some(
    (row) => !!row?.submittedData?.ipAddress
  );

  function transformString() {
    widgetName = widgetName.replace(/\s+/g, '-').toLowerCase();
    widgetName = widgetName.replace(/[^a-z0-9-]/g, '');
    widgetName = widgetName.replace(/-+/g, '-');

    const currentDate = new Date()
      .toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-');

    return `export-${widgetName}-${currentDate}`;
  }

  const fileName = transformString() + '.xlsx';

  const normalizeData = (value: unknown, fieldType?: string) => {
    let parsedValue;

    try {
      parsedValue = JSON.parse(String(value));
    } catch (error) {}

    if (Array.isArray(parsedValue)) {
      return [...parsedValue].join(' | ');
    }

    if (typeof value === 'object') {
      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === 'object') {
          return value
            .map((item: object) => {
              return Object.entries(item)
                .map(([key, val]) => `${key}: ${val}`)
                .join(', ');
            })
            .join(' | ');
        }
      }

      // Known issue: a null value passes the typeof check and makes Object.entries throw.
      return Object.entries(value!)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');
    }

    if (typeof value === 'string') {
      let escapedValue = value.replace(/(\r\n|\r\r|\n\n|\n|\r)+/g, '\n');
      escapedValue = escapedValue.replace(/"/g, "'");

      return `${escapedValue}`;
    }

    return value;
  };

  const fieldKeyToTitleMap = new Map();
  const multipleChoiceOptionsMap = new Map<
    string | undefined,
    { title: string; options: string[] }
  >();

  if (selectedWidget && selectedWidget.config?.items?.length > 0) {
    selectedWidget.config.items.forEach((item: FormItem) => {
      if (
        item.questionType === 'none' &&
        selectedWidget?.type !== 'distributionmodule'
      )
        return;

      const title = item.title || item.fieldKey;
      if (item.questionType === 'matrix') {
        item.matrix?.rows?.forEach((row) => {
          const matrixKey = `matrix_${item.fieldKey}_${row.trigger}`;
          fieldKeyToTitleMap.set(matrixKey, `${title}: ${row.text}`);
        });
      } else if (title && item.questionType !== 'pagination') {
        fieldKeyToTitleMap.set(item.fieldKey || title, title);
      }

      if (
        settings?.splitMultipleChoice &&
        (item.questionType === 'multiplechoice' ||
          item.questionType === 'multiple') &&
        item.options &&
        Array.isArray(item.options)
      ) {
        const optionLabels: string[] = [];
        item.options.forEach((option) => {
          const optionTitle =
            option.titles?.[0]?.key ||
            option.titles?.[0]?.title ||
            option.value ||
            option.label ||
            '';
          if (optionTitle) {
            optionLabels.push(optionTitle);
          }
        });
        if (optionLabels.length > 0) {
          multipleChoiceOptionsMap.set(item.fieldKey, {
            // Known issue: an item without title and fieldKey makes stripHtmlTags throw.
            title: stripHtmlTags(title!),
            options: optionLabels,
          });
        }
      }

      if (item.options && Array.isArray(item.options)) {
        item.options.forEach((option, index: number) => {
          const titles = option.titles;
          if (
            titles &&
            Array.isArray(titles) &&
            titles.length > 0 &&
            titles[0].isOtherOption
          ) {
            const otherTitle =
              titles[0].key || titles[0].title || 'Anders, namelijk';

            const triggerKey = `${item.fieldKey}_${option.trigger}_other`;
            const indexKey = `${item.fieldKey}_${index}_other`;
            const possibleKeys =
              triggerKey === indexKey ? [triggerKey] : [triggerKey, indexKey];

            possibleKeys.forEach((key) => {
              const hasData = data.some((row) => !!row?.submittedData?.[key]);
              if (hasData) {
                fieldKeyToTitleMap.set(key, otherTitle);
              }
            });
          }
        });
      }
    });
  }

  const rows = data.map((row) => {
    const rowData: Record<string, unknown> = {
      ID: row.id || ' ',
      'Aangemaakt op': row.createdAt || ' ',
      'Project ID': row.projectId || ' ',
      Widget: widgetName || ' ',
      ...(includeSpamColumn
        ? { 'Waarschijnlijk spam': row.isSpam ? 'Ja' : 'Nee' }
        : {}),
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

    if (includeHashedIpColumn) {
      rowData['Gebruikers IP-adres (gehasht)'] =
        row?.submittedData?.ipAddress || ' ';
    }

    const keyCount: Record<string, number> = {};
    Array.from(fieldKeyToTitleMap.entries()).forEach(([key, title]) => {
      let rawValue = row.submittedData?.[key];

      if (key?.startsWith('matrix')) {
        rawValue =
          fetchMatrixData(
            key,
            selectedWidget?.config?.items,
            row?.submittedData || [],
            false
          ) || '';
      }

      const fieldType = (selectedWidget?.config?.items || []).find(
        (item: FormItem) => item.fieldKey === key
      )?.questionType;
      const fieldTitle = (selectedWidget?.config?.items || []).find(
        (item: FormItem) => item.fieldKey === key
      )?.title;

      if (
        typeof rawValue === 'object' &&
        (fieldType === 'swipe' || fieldType === 'dilemma')
      ) {
        Object.values<ChoiceAnswer>(rawValue).forEach((item) => {
          let returnText = fieldType === 'swipe' ? item.answer : item.title;
          if (item.explanation) returnText += `: ${item.explanation}`;

          if (fieldType === 'dilemma') {
            const dilemmaId = !isNaN(Number(item.dilemmaId))
              ? Number(item.dilemmaId) + 1
              : '';
            const header = fieldTitle
              ? `${fieldTitle} ${dilemmaId}`
              : `Keuze ${dilemmaId || item.dilemmaId}`;
            rowData[stripHtmlTags(header)] = returnText;
          }

          if (fieldType === 'swipe') {
            let header = item.title ? item.title : `Keuze ${item.cardId}`;
            header = `${title}: ${header}`;
            rowData[stripHtmlTags(header)] = returnText;
          }
        });
        return;
      }

      if (multipleChoiceOptionsMap.has(key)) {
        const mcConfig = multipleChoiceOptionsMap.get(key)!;
        const selectedValues = normalizeToArray(rawValue);

        mcConfig.options.forEach((optionLabel) => {
          const columnHeader = `${mcConfig.title}: ${stripHtmlTags(
            optionLabel
          )}`;
          const isSelected = selectedValues.some(
            (val) => val.toLowerCase() === optionLabel.toLowerCase()
          );
          rowData[columnHeader] = isSelected ? 'Ja' : 'Nee';
        });
        return;
      }

      const baseKey = title;
      let keyHeader = keyCount[baseKey]
        ? `${baseKey} (${keyCount[baseKey]++})`
        : ((keyCount[baseKey] = 1), baseKey);

      keyHeader = keyHeader && stripHtmlTags(keyHeader);

      rowData[keyHeader] = normalizeData(rawValue, fieldType || '');
    });
    if (selectedWidget?.type !== 'distributionmodule') {
      rowData['Embedded URL'] = row?.submittedData?.embeddedUrl || '';
    }
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Export');
  XLSX.writeFile(workbook, fileName);
};
