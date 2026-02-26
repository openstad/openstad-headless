import flattenObject from '@/lib/export-helpers/flattenObject';
import * as XLSX from 'xlsx';

export const exportToXLSX = (
  data: any[],
  fileName: string,
  keyMap: Record<string, string>
) => {
  const cleanedData = data.map((item) => {
    const flat = flattenObject(item);
    const cleaned: Record<string, any> = {};
    Object.entries(keyMap).forEach(([key, label]) => {
      // Handle wildcard keys like tags.*
      if (key.endsWith('.*')) {
        const prefix = key.replace('.*', '');

        Object.keys(flat).forEach((flatKey) => {
          if (flatKey.startsWith(prefix + '.')) {
            const type = flatKey.substring(prefix.length + 1); // Skip "prefix."
            cleaned[`${label}.${type}`] = flat[flatKey];
          }
        });
      } else if (flat.hasOwnProperty(key)) {
        cleaned[label] = flat[key];
      }
    });
    return cleaned;
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(cleanedData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName);
};
