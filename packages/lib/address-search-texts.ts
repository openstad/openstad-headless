export type FoundAddress = {
  straat?: string;
  huisnummer?: string;
  woonplaats?: string;
};

export const defaultAddressSearchTexts = {
  foundText: 'Gevonden: {street} {houseNumber}, {city}',
  notFoundText:
    'Geen adres gevonden voor deze combinatie van postcode en huisnummer.',
  errorText:
    'Het adres kon niet worden opgezocht. Probeer het later opnieuw of klik de locatie aan op de kaart.',
  outsideAreaText:
    'Het gevonden adres ligt buiten het gebied waarbinnen een locatie gekozen kan worden.',
};

export const renderFoundAddressText = (
  template: string,
  address: FoundAddress
) =>
  template
    .replace(/\{street\}/g, address.straat || '')
    .replace(/\{houseNumber\}/g, address.huisnummer || '')
    .replace(/\{city\}/g, address.woonplaats || '');
