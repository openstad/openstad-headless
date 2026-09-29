type FlatRecord = Record<string, unknown>;

const flattenObject = (
  obj: object,
  parent: string = '',
  res: FlatRecord = {}
): FlatRecord => {
  for (const [key, value] of Object.entries(obj)) {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      if (key === 'extraData') {
        const cleanedExtraData = cleanExtraData(value);
        if (cleanedExtraData.embeddedUrl) {
          res[`${propName}.embeddedUrl`] = cleanedExtraData.embeddedUrl;
          delete cleanedExtraData.embeddedUrl;
        }
        res[propName] = JSON.stringify(cleanedExtraData);
      } else if (Array.isArray(value)) {
        res[propName] = value.map((item) => JSON.stringify(item)).join(',');
      } else {
        flattenObject(value, propName, res);
      }
    } else {
      res[propName] = value;
    }
  }
  return res;
};

const cleanExtraData = (obj: object): FlatRecord => {
  const dbFixedColumns = [
    'title',
    'summary',
    'description',
    'budget',
    'images',
    'location',
    'tags',
    'documents',
  ];
  const cleanedObj: FlatRecord = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!dbFixedColumns.includes(key)) {
      cleanedObj[key] = value;
    }
  }
  return cleanedObj;
};
export default flattenObject;
