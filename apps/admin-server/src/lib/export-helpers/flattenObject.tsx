const flattenObject = (obj: any, parent: string = '', res: any = {}) => {
    for (let key in obj) {
        const propName = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
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

  export default flattenObject;