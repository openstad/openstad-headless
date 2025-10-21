export const keyMap: Record<string, string> = {
  id: 'Inzending ID',
  projectId: 'Project ID',
  widgetId: 'Widget ID',
  title: 'Titel',
  summary: 'Samenvatting',
  description: 'Beschrijving',
  budget: 'Budget',
  'location.lat': 'Locatie (lat)',
  'location.lng': 'Locatie (lng)',
  createDateHumanized: 'Datum aangemaakt (leesbaar)',
  updatedAt: 'Laatst bijgewerkt',
  deletedAt: 'Verwijderd op',
  yes: 'Aantal likes',
  no: 'Aantal dislikes',
  progress: 'Voortgang',
  statuses: 'Statussen',
  modBreak: 'Moderatie bericht',
  modBreakDate: 'Moderatie bericht datum',
  images: 'Afbeeldingen',
  tags: 'Tags',
  documents: 'Documenten',
  'user.id': 'Gebruiker ID',
  'user.role': 'Gebruiker rol',
  'user.name': 'Gebruiker naam',
  'user.email': 'Gebruiker e-mailadres',
  'user.phonenumber': 'Gebruiker telefoonnummer',
  'user.address': 'Gebruiker adres',
  'user.city': 'Gebruiker woonplaats',
  'user.postcode': 'Gebruiker postcode',
};

// mapping from humanReadable to backendKey
export const reverseKeyMap: Record<string, string> = Object.fromEntries(
  Object.entries(keyMap).map(([backend, humanReadable]) => [humanReadable, backend])
);