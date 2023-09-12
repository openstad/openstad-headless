exports.fields = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'email',
    label: 'Email address',
  },
  {
    key: 'phoneNumber',
    label: 'Phone number',
  },
  {
    key: 'streetName',
    label: 'Street name',
  },
  {
    key: 'houseNumber',
    label: 'House number',
  },
  {
    key: 'city',
    label: 'City',
  },
  {
    key: 'suffix',
    label: 'Suffix',
  },
  {
    key: 'postcode',
    label: 'Postcode',
  }
];

exports.validation = {
  profile : {
    name : {
      errorMessage: 'Naam moet ingevuld zijn',
      isLength: {
        options:{ min: 1, maxLength: 155 }
      }
    },
    // E-mail is not validated, since in most re
    email : {
      errorMessage: 'E-mail is niet correct',
      isLength: { options:{ min: 1, maxLength: 155 }},
      isEmail: true
    }
  }
}
;
