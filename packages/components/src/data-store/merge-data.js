import merge from 'merge';

export default function mergeData(currentData, newData, action) {

  let result;

  switch (action) {

    case 'create':
      if (Array.isArray(currentData)) {
        result = [ ...currentData ];
        result.push(newData);
      } else {
        result = merge.recursive({}, currentData, newData)
      }
      break;

    case 'update':
      if (Array.isArray(currentData)) {
        let index = currentData.findIndex(elem => elem.id == newData.id);
        if (index != -1) {
          result = [ ...currentData ];
          result[index] = merge.recursive({}, result[index], newData);
        }
      } else {
        result = merge.recursive({}, currentData, newData)
      }
      break;

    case 'delete':
      if (Array.isArray(currentData)) {
        let index = currentData.findIndex(elem => elem.id == newData.id);
        if (index != -1) {
          result = [ ...currentData ];
          result.splice(index, 1);
        }
      } else {
        result = undefined;
      }
      break;

    default: return currentData;

  }
  
  return result || currentData;
  
}
