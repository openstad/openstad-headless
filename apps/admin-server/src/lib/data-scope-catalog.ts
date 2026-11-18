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
    ],
  },
  votes: {
    label: 'Stemmen',
    personalFields: [],
  },
  comments: {
    label: 'Reacties',
    personalFields: [{ key: 'description', label: 'Reactietekst' }],
  },
  submissions: {
    label: 'Enquêtes',
    // Answers are exposed via the separate field_<key> opt-in instead.
    personalFields: [],
  },
  choiceguides: {
    label: 'Keuzewijzers',
    // 'result' (the raw answers blob) is intentionally NOT listed here — it
    // is always blocked (see ALWAYS_BLOCKED_BLOBS in report-data-scope.js).
    // Answers are exposed via the separate answer_<key> opt-in instead.
    personalFields: [],
  },
  // ADDITIVE (reporting endpoints, issue #1651): the project's own metadata is
  // public and has no personal fields.
  projects: {
    label: 'Projecten',
    personalFields: [],
  },
  // ADDITIVE (reporting endpoints, issue #1653): choice-guide definition
  // content (guide + question definitions) is admin-authored structure, not
  // participant data — no personal fields.
  choiceguideguides: {
    label: 'Keuzewijzers (definitie)',
    personalFields: [],
  },
  choiceguidequestions: {
    label: 'Keuzewijzer vragen',
    personalFields: [],
  },
  // Dedicated opt-in for the anonymized/aggregated participant endpoints
  // (/reports/users/anonymized, /reports/users/aggregates). Deliberately
  // separate from every other component's toggle: those endpoints return a
  // project-wide participant roster across ALL data sources, so enabling e.g.
  // only 'votes' reporting must NOT also unlock this. No personal fields to
  // opt into — the exposed shape is fixed (pseudonymized id, role, timestamps).
  users: {
    label: 'Deelnemers (geanonimiseerd)',
    personalFields: [],
  },
} as const;
