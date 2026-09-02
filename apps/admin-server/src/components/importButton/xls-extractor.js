import XLSX from 'xlsx';

import { translateHeaders } from './translate-headers';

export async function processXlsFile(file, parseConfig = {}) {
  const xlsData = await getXlsData(file, parseConfig);
  let result = processXlsData(xlsData);
  return result;
}

export async function getXlsData(file, inputConfig = {}) {
  let config = {};

  const isObject = inputConfig && typeof inputConfig === 'object';

  if (isObject) {
    config = inputConfig;
  }

  return new Promise(async (resolve, reject) => {
    try {
      let data = await file.arrayBuffer();
      let workbook = XLSX.read(data);
      let first_sheet_name = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[first_sheet_name];
      let result = XLSX.utils.sheet_to_json(worksheet);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

export function processXlsData(data) {
  if (!data || !data.length) return data;

  // Translate every row before flattening dot notation keys into nested objects.
  return data
    .map((row) => translateHeaders(row))
    .map((row) => processXlsRow(row));
}

export function processXlsRow(row) {
  const result = {};
  const dottedKeys = [];

  Object.keys(row).forEach((key) => {
    if (key.match(/^(\w+)\.(\w+)$/)) {
      dottedKeys.push(key);
    } else {
      result[key] = processXlsValue(row[key]);
    }
  });

  dottedKeys.forEach((key) => {
    const [, parent, child] = key.match(/^(\w+)\.(\w+)$/);

    if (
      typeof result[parent] !== 'object' ||
      result[parent] === null ||
      Array.isArray(result[parent])
    ) {
      result[parent] = {};
    }
    result[parent][child] = processXlsValue(row[key]);
  });

  return result;
}

export function processXlsValue(value) {
  try {
    value = JSON.parse(value);
  } catch (err) {}

  return value;
}
