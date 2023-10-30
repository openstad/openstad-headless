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

    case 'submitLike':
    console.log('MERGEDATA', 'submitLike');
      if (Array.isArray(currentData)) {
        let index = currentData.findIndex(elem => elem.id == newData.id);
        if (index != -1) {
          result = [ ...currentData ];
          result.splice(index, 1);
        }
      } else {
        let delta = { [newData.opinion]: currentData[newData.opinion] + 1 };
        let userVote = currentData.userVote;
        if (userVote) {
          delta[userVote.opinion] = currentData[userVote.opinion] - 1;
        }
        result = merge.recursive({}, currentData, delta)
      }
    break;

    default: return currentData;

  }
  
  return result || currentData;
  
}
