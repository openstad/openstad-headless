const countFailedImportRows = (fileValidationNotifications) => {
  const apiValidationErrors = fileValidationNotifications.filter(
    notification => notification.messageType === 'apiValidationError'
  );

  return apiValidationErrors.length;
};

export default countFailedImportRows;