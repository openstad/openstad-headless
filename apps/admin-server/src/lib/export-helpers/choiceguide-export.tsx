import { stripHtmlTags } from '@openstad-headless/lib/strip-html-tags';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

import { InitializeWeights } from '../../../../../packages/choiceguide/src/parts/init-weights';
import { calculateScoreForItem } from '../../../../../packages/choiceguide/src/parts/scoreUtils';
import { fetchMatrixData } from './fetch-matrix-data';

export const exportChoiceGuideToCSV = (
  widgetName: string,
  selectedWidget: any,
  project: string,
  limit: number
) => {
  const fetchResults = async () => {
    let allData: any = [];
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

    const fetchBatch = async (page: number, retries: number = 0) => {
      try {
        const url = `/api/openstad/api/project/${projectNumber}/choicesguide?page=${page}&limit=50&widgetId=${selectedWidget?.id}&includeUser=1`;
        const response = await fetch(url);

        if (!response.ok) {
          console.error('Error fetching data:', response.statusText);
          throw new Error('Failed to fetch');
        }

        const data = await response.json();
        const currentBatch = data?.data || [];

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

        if (item.type === 'matrix') {
          item.matrix?.rows?.forEach((row: any) => {
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
            (option: {
              titles: [
                { key?: string; title?: string; isOtherOption?: boolean },
              ];
              trigger: string;
            }) => {
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
                const otherKey = `${newKey}_${option.trigger}_other`;

                fieldKeyToTitleMap.set(otherKey, otherTitle);
              }
            }
          );
        }
      });

      data = data.map((row: any) => {
        const scores: { [key: string]: any } = {};
        const result = row?.result || {};
        const hiddenFields = result?.hiddenFields || [];

        let weights: any = {};
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

        choiceOptions.forEach((choiceOption: any) => {
          try {
            const calculatedScores = calculateScoreForItem(
              choiceOption,
              row?.result || {},
              weights,
              choiceType,
              hiddenFields,
              items
            );
            scores[choiceOption.title] = calculatedScores.x
              ? calculatedScores.x.toFixed(0)
              : 0;
          } catch (error) {
            scores[choiceOption.title] = 0;
          }
        });

        const rowMap = new Map();
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

        Object.keys(scores).forEach((key: any) => {
          const index = rowMap.size;
          rowMap.set(index, { result: scores[key], value: `Score: ${key}` });
        });

        if (
          process.env.NEXT_PUBLIC_HASH_IP_ADDRESSES === 'true' &&
          row?.result?.ipAddress
        ) {
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

    const normalizeData = (value: any) => {
      let parsedValue;

      try {
        parsedValue = JSON.parse(value);
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

    const rows: any[] = [];

    data.forEach((row: any) => {
      const rowObj: Record<string, any> = {
        ID: row.id,
        'Aangemaakt op': row.createdAt,
        'Project ID': row.projectId,
        Widget: widgetName,
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

      if (process.env.NEXT_PUBLIC_HASH_IP_ADDRESSES === 'true') {
        rowObj['Gebruikers IP-adres (gehasht)'] = row?.result?.ipAddress || ' ';
      }

      const keyCount: Record<string, number> = {};
      Object.values(row.result || {}).forEach((item: any) => {
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
