exports.fields = [
  {
    key: 'name',
    label: 'Naam',
  },
  {
    key: 'email',
    label: 'E-mail adres',
  },
  {
    key: 'phoneNumber',
    label: 'Telefoonnummer',
  },
  {
    key: 'streetName',
    label: 'Straat',
  },
  {
    key: 'houseNumber',
    label: 'Huisnummer',
  },
  {
    key: 'suffix',
    label: 'Toevoeging',
  },
  {
    key: 'postcode',
    label: 'Postcode',
  },
  {
    key: 'city',
    label: 'Woonplaats',
  },
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
