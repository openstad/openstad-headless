const validateFileData = async (dataRows, schema) => {

  if (!dataRows.length > 0) {
    return [{
      messageType: 'zeroRows',
      color: 'blue',
      message: `There are no rows in the file`,
    }];
  }

  let validationMessages = [];

  /**
   * Check for id
   */
  if(dataRows[0].hasOwnProperty('id')) {
    validationMessages.push({
      messageType: 'idColumnPresent',
      color: 'blue',
      message: 'Id column is present in file; Import override enabled',
    });
  } else {
    validationMessages.push({
      messageType: 'idColumn',
      color: 'blue',
      message: 'NO Id column is present in file; Import new enabled',
    });
  }

  let schemaValidationMessages = [];

  /**
   * Validate schema
   */
  Object.keys(schema).forEach((key) => {
    if (!dataRows[0].hasOwnProperty(key))
      schemaValidationMessages.push({
        messageType: 'schemaError',
        color: 'red',
        message: `Import is missing the following column: ${key}`,
      });
  });

  /**
   * Check if parsing went correctly
   */
  if(schemaValidationMessages.length > 2 && schemaValidationMessages.length >= Object.keys(schema).length) {
    schemaValidationMessages.push({
      messageType: 'faultyImport',
      color: 'red',
      message: 'It seems the import provided scrambled results.',
    });
  }

  return schemaValidationMessages.concat(validationMessages);
};

export default validateFileData;