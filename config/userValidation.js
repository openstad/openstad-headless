exports.fields = [
  {
    key: 'firstName',
    message: 'Voornaam moet ingevuld zijn',
    required: true,
    maxLength: 155
  },
  {
    key: 'lastName',
    message: 'Achternaam moet ingevuld zijn',
    required: true,
    maxLength: 155
  },
  {
    key: 'email',
    required: true,
    maxLength: 155,
    email: true
  },
  {
    key: 'firstName',
    required: true,
    maxLength: 155
  },
];
