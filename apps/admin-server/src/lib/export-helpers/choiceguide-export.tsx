import { stripHtmlTags } from '@openstad-headless/lib/strip-html-tags';
import type { ApiUser, ApiWidget, DynamicJson } from '@openstad-headless/types';
import * as XLSX from 'xlsx';

import { InitializeWeights } from '../../../../../packages/choiceguide/src/parts/init-weights';
import { calculateScoreForItem } from '../../../../../packages/choiceguide/src/parts/scoreUtils';
import type { ChoiceOptions } from '../../../../../packages/choiceguide/src/props';
import { fetchMatrixData } from './fetch-matrix-data';
import { getRuntimeSpamFilterEnabled } from './get-runtime-spam-flag';

// Choiceguide config item, as far as this export reads it.
type ChoiceGuideItem = {
  type?: string;
  trigger?: string;
  title?: string;
  description?: string;
  explanationA?: string;
  explanationB?: string;
  matrix?: { rows?: { trigger: string; text?: string }[] };
  options?: {
    titles: [{ key?: string; title?: string; isOtherOption?: boolean }];
    trigger: string;
  }[];
};

// Choiceguide answer value as stored in the result JSON column.
type ChoiceGuideAnswer = {
  skipQuestion?: boolean;
  skipQuestionExplanation?: string;
  lat?: number;
  lng?: number;
  value?: unknown;
};

type ChoiceGuideCell = {
  result: string | number | ChoiceGuideAnswer | null | undefined;
  value: string;
};

// Row as returned by the choicesguide results endpoint (with includeUser).
type ChoiceGuideResultRow = {
  id: number;
  createdAt: string;
  projectId: number;
  userId: number | null;
  isSpam?: boolean;
  // Known issue: the api returns `phoneNumber`, so `phonenumber` is always undefined and the export column stays empty.
  user?: (Partial<ApiUser> & { phonenumber?: string }) | null;
  result?: DynamicJson;
};

export const exportChoiceGuideToCSV = async (
  widgetName: string,
  selectedWidget: ApiWidget | null | undefined,
  project: string,
  limit: number
) => {
  const includeSpamColumn = await getRuntimeSpamFilterEnabled();

  const fetchResults = async () => {
    let allData: ChoiceGuideResultRow[] = [];
    let page = 0;
    let hasMoreData = true;
    const maxRetries = 3;
    const retryDelay = 2000;
    const projectNumber = parseInt(project as string);

    if (
      !selectedWidget ||
      !selectedWidget?.id ||
      isNaN(projectNumber) ||
      isNaN(limit) ||
      isNaN(page)
    ) {
      return [];
    }

    const fetchBatch = async (
      page: number,
      retries: number = 0
    ): Promise<ChoiceGuideResultRow[]> => {
      try {
        const url = `/api/openstad/api/project/${projectNumber}/choicesguide?page=${page}&limit=50&widgetId=${selectedWidget?.id}&includeUser=1`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          throw new Error('Failed to fetch');
        }

        const data = await response.json();
        const currentBatch: ChoiceGuideResultRow[] = data?.data || [];

        if (currentBatch.length < 50) {
          hasMoreData = false;
        }

        return currentBatch;
      } catch (error) {
        if (retries < maxRetries) {
          console.log(`Retrying batch ${page}, attempt ${retries + 1}...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchBatch(page, retries + 1);
        } else {
          console.error(`Batch ${page} failed after ${maxRetries} retries`);
          return [];
        }
      }
    };

    while (hasMoreData) {
      const currentBatch = await fetchBatch(page);

      if (currentBatch.length > 0) {
        allData = [...allData, ...currentBatch];
      }

      page += 1;
    }

    return allData;
  };

  fetchResults().then((data) => {
    data = data || [];
    const includeHashedIpColumn = data.some((row) => !!row?.result?.ipAddress);

    if (
      selectedWidget &&
      selectedWidget?.config &&
      selectedWidget?.config?.items &&
      !!data
    ) {
      const items = selectedWidget?.config?.items || [];
      const choiceOptions =
        selectedWidget?.config?.choiceOption?.choiceOptions || [];
      const choiceType = selectedWidget?.config?.choicesType || 'default';

      const fieldKeyToTitleMap = new Map();
      items.forEach((item: ChoiceGuideItem) => {
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

        if (item.type === 'matrix') {
          item.matrix?.rows?.forEach((row) => {
            const matrixKey = `${newKey}_${row.trigger}`;
            fieldKeyToTitleMap.set(matrixKey, `${title}: ${row.text}`);
          });
        } else {
          fieldKeyToTitleMap.set(newKey, title);
        }

        if (
          item.options &&
          Array.isArray(item.options) &&
          item.options.length > 0
        ) {
          item.options.forEach(
            (
              option: {
                titles: [
                  { key?: string; title?: string; isOtherOption?: boolean },
                ];
                trigger: string;
              },
              index: number
            ) => {
              if (
                !!option.titles &&
                Array.isArray(option.titles) &&
                option.titles.length > 0 &&
                option.titles[0].isOtherOption
              ) {
                const otherTitle = `${
                  option.titles[0].key ||
                  option.titles[0].title ||
                  'Anders, namelijk'
                }`;
                const triggerKey = `${newKey}_${option.trigger}_other`;
                const indexKey = `${newKey}_${index}_other`;
                const possibleKeys =
                  triggerKey === indexKey
                    ? [triggerKey]
                    : [triggerKey, indexKey];

                possibleKeys.forEach((key) => {
                  const hasData = data.some((row) => !!row?.result?.[key]);
                  if (hasData) {
                    fieldKeyToTitleMap.set(key, otherTitle);
                  }
                });
              }
            }
          );
        }
      });

      data = data.map((row) => {
        const scores: { [key: string]: string | number } = {};
        const result = row?.result || {};
        const hiddenFields = result?.hiddenFields || [];

        let weights: Parameters<typeof calculateScoreForItem>[2] = {};
        try {
          weights = InitializeWeights(
            items,
            choiceOptions,
            choiceType,
            hiddenFields
          );
        } catch (error) {
          weights = {};
        }

        choiceOptions.forEach((choiceOption: ChoiceOptions) => {
          try {
            const calculatedScores = calculateScoreForItem(
              choiceOption,
              row?.result || {},
              weights,
              choiceType,
              hiddenFields,
              items
            );
            scores[String(choiceOption.title)] = calculatedScores.x
              ? calculatedScores.x.toFixed(0)
              : 0;
          } catch (error) {
            scores[String(choiceOption.title)] = 0;
          }
        });

        const rowMap = new Map<number, ChoiceGuideCell>();
        fieldKeyToTitleMap.forEach((value, key) => {
          const index = Array.from(fieldKeyToTitleMap.keys()).indexOf(key);

          if (key?.startsWith('matrix')) {
            const rowResult =
              fetchMatrixData(key, items, row?.result || []) || '-';

            rowMap.set(index, { result: rowResult, value: value });
          } else if (row?.result && row?.result[key]) {
            rowMap.set(index, { result: row?.result[key], value: value });
          } else {
            rowMap.set(index, { result: '-', value: value });
          }
        });

        Object.keys(scores).forEach((key) => {
          const index = rowMap.size;
          rowMap.set(index, { result: scores[key], value: `Score: ${key}` });
        });

        if (includeHashedIpColumn && row?.result?.ipAddress) {
          const index = rowMap.size;
          rowMap.set(index, {
            result: row?.result?.ipAddress,
            value: 'Gebruikers IP-adres (gehasht)',
          });
        }

        return {
          ...row,
          result: Object.fromEntries(rowMap),
        };
      });
    }

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

    const normalizeData = (value: ChoiceGuideCell['result']) => {
      let parsedValue;

      try {
        parsedValue = JSON.parse(String(value));
      } catch (error) {}

      if (Array.isArray(parsedValue)) {
        return [...parsedValue].join(' | ');
      }

      if (value && typeof value === 'object') {
        if (value.skipQuestion) {
          return value?.skipQuestionExplanation || '-';
        } else if (value?.lat && value?.lng) {
          return `${value?.lat}, ${value?.lng}`;
        } else {
          return value?.value || '-';
        }
      }

      if (typeof value === 'string') {
        let escapedValue = value.replace(/(\r\n|\r\r|\n\n|\n|\r)+/g, '\n');
        escapedValue = escapedValue.replace(/"/g, "'");

        return `${escapedValue}`;
      }

      return value;
    };

    const rows: Record<string, unknown>[] = [];

    data.forEach((row) => {
      const rowObj: Record<string, unknown> = {
        ID: row.id,
        'Aangemaakt op': row.createdAt,
        'Project ID': row.projectId,
        Widget: widgetName,
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
        rowObj['Gebruikers IP-adres (gehasht)'] = row?.result?.ipAddress || ' ';
      }

      const keyCount: Record<string, number> = {};
      Object.values(row.result || {}).forEach((item: ChoiceGuideCell) => {
        const baseKey = item.value;
        let key = keyCount[baseKey]
          ? `${baseKey} (${keyCount[baseKey]++})`
          : ((keyCount[baseKey] = 1), baseKey);

        key = key && stripHtmlTags(key);

        rowObj[key] = normalizeData(item.result);
      });

      rows.push(rowObj);
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Keuzewijzer');

    XLSX.writeFile(workbook, fileName);
  });
};
