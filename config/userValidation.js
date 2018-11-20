
/**
 * Using schema based validation with Express Validator.
 * Express validator documentation is not very complete.
 * Refer to underlying validation library for proper syntax: https://github.com/chriso/validator.js
 */
exports.fields = {
  firstName : {
    errorMessage: 'Voornaam moet ingevuld zijn',
    isLength: {
      options:{ min: 1, maxLength: 155 }
    }
  },
  lastName: {
    errorMessage: 'Achternaam moet ingevuld zijn',
    isLength: {
      options:{ min: 1, maxLength: 155 }
    }
  },
  email : {
    errorMessage: 'E-mail is niet correct',
    isLength: { options:{ min: 1, maxLength: 155 }},
    isEmail: true
  }
};
