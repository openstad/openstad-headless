export default (fileValidationNotifications) => {
  const apiValidationErrors = fileValidationNotifications.filter(notification => notification['messageType'] === 'apiValidationError');

  if(apiValidationErrors){
    return apiValidationErrors.length;
  }

  return 0;
};
