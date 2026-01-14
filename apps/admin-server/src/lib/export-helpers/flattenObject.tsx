const flattenObject = (obj: any, parent: string = '', res: any = {}) => {
    for (let key in obj) {
        const propName = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if ( key === 'extraData' ) {
                const cleanedExtraData = cleanExtraData(obj[key]);
                res[propName] = JSON.stringify(cleanedExtraData);
            } else if (Array.isArray(obj[key])) {
                res[propName] = obj[key].map((item: any) => JSON.stringify(item)).join(',');
            } else {
                flattenObject(obj[key], propName, res);
            }
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
};

const cleanExtraData = (obj: any) => {
    const dbFixedColumns = ['title', 'summary', 'description', 'budget', 'images', 'location', 'tags', 'documents'];
    const cleanedObj: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (!dbFixedColumns.includes(key)) {
                cleanedObj[key] = obj[key];
            }
        }
    }
    return cleanedObj;
}
  export default flattenObject;