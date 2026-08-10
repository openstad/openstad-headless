// Friendly labels for the data-scope admin UI.
//
// IMPORTANT: the set of personalField KEYS per component MUST stay in sync with
// the catalog in packages/lib/report-data-scope.js (the backend source of
// truth that actually enforces field exposure). This is verified by
// apps/api-server/src/middleware/data-scope-catalog-parity.test.js — if you add
// or remove a personal field on either side, update both or the test fails.

export type PersonalField = { key: string; label: string };

export type DataScopeComponent = {
  label: string;
  personalFields: PersonalField[];
};

export const DATA_SCOPE_COMPONENTS = {
  resources: {
    label: 'Plannen',
    personalFields: [
      { key: 'title', label: 'Titel' },
      { key: 'summary', label: 'Samenvatting' },
      { key: 'description', label: 'Beschrijving' },
      { key: 'images', label: 'Afbeeldingen' },
      { key: 'user.displayName', label: 'Weergavenaam (gepseudonimiseerd)' },
      { key: 'user.nickName', label: 'Bijnaam (gepseudonimiseerd)' },
    ],
  },
  votes: {
    label: 'Stemmen',
    personalFields: [
      { key: 'user.displayName', label: 'Weergavenaam (gepseudonimiseerd)' },
      { key: 'user.nickName', label: 'Bijnaam (gepseudonimiseerd)' },
    ],
  },
  comments: {
    label: 'Reacties',
    personalFields: [
      { key: 'description', label: 'Reactietekst' },
      { key: 'user.displayName', label: 'Weergavenaam (gepseudonimiseerd)' },
      { key: 'user.nickName', label: 'Bijnaam (gepseudonimiseerd)' },
    ],
  },
  submissions: {
    label: 'Enquêtes',
    personalFields: [
      { key: 'user.displayName', label: 'Weergavenaam (gepseudonimiseerd)' },
      { key: 'user.nickName', label: 'Bijnaam (gepseudonimiseerd)' },
    ],
  },
  choiceguides: {
    label: 'Keuzewijzers',
    personalFields: [
      { key: 'result', label: 'Keuzewijzer antwoorden' },
      { key: 'user.displayName', label: 'Weergavenaam (gepseudonimiseerd)' },
      { key: 'user.nickName', label: 'Bijnaam (gepseudonimiseerd)' },
    ],
  },
} as const;
