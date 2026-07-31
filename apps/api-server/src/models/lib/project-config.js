module.exports = {
  allowedDomains: {
    type: 'arrayOfStrings',
    default: [],
  },

  project: {
    type: 'object',
    subset: {
      endDate: {
        type: 'string', // todo: add date type
        default: null,
      },
      endDateNotificationSent: {
        type: 'boolean',
        default: false,
      },
      projectHasEnded: {
        type: 'boolean',
        default: false,
      },
    },
  },

  anonymize: {
    type: 'object',
    subset: {
      allowAnonymizeUsersAfterEndDate: {
        type: 'boolean',
        default: false,
      },
      anonymizeUsersXDaysAfterEndDate: {
        type: 'int',
        default: 60,
      },
      warnUsersAfterXDaysOfInactivity: {
        type: 'int',
        default: 770,
      },
      anonymizeUsersAfterXDaysOfInactivity: {
        type: 'int',
        default: 860,
      },
      anonymizeUserName: {
        type: 'string',
        default: 'Gebruiker is geanonimiseerd',
      },
    },
  },

  auth: {
    type: 'object',
    subset: {
      default: {
        type: 'string',
        default: 'openstad',
      },
      adapter: {
        type: 'object',
        default: {},
      },
      provider: {
        type: 'object',
        default: {},
      },
    },
  },

  resources: {
    type: 'object',
    subset: {
      canAddNewResources: {
        type: 'boolean',
        default: true,
      },
      titleMinLength: {
        type: 'int',
        default: 10,
      },
      titleMaxLength: {
        type: 'int',
        default: 50,
      },
      summaryMinLength: {
        type: 'int',
        default: 20,
      },
      summaryMaxLength: {
        type: 'int',
        default: 140,
      },
      descriptionMinLength: {
        type: 'int',
        default: 140,
      },
      descriptionMaxLength: {
        type: 'int',
        default: 5000,
      },
      minimumYesVotes: {
        type: 'int',
        default: 100,
      },
      showVoteButtons: {
        // momenteel alleen voor de kaart-app
        type: 'boolean',
        default: true,
      },
      canEditAfterFirstLikeOrComment: {
        type: 'boolean',
        default: false,
      },
      extraData: {
        type: 'object',
      },
    },
  },

  comments: {
    type: 'object',
    subset: {
      canComment: {
        type: 'boolean',
        default: true,
      },
      requiredUserRole: {
        type: 'string',
        default: 'member',
      },
      closedText: {
        type: 'string',
        default:
          'De reactiemogelijkheid is gesloten, u kunt niet meer reageren',
      },
      canReply: {
        type: 'boolean',
        default: true,
      },
      canLike: {
        type: 'boolean',
        default: true,
      },
      canDislike: {
        type: 'boolean',
        default: false,
      },
      descriptionMinLength: {
        type: 'number',
        default: 30,
      },
      descriptionMaxLength: {
        type: 'number',
        default: 500,
      },
    },
  },

  users: {
    type: 'object',
    subset: {
      extraData: {
        type: 'object',
      },
      canCreateNewUsers: {
        type: 'boolean',
        default: true,
      },
      allowUseOfNicknames: {
        type: 'boolean',
        default: false,
      },
    },
  },

  votes: {
    type: 'object',
    subset: {
      isViewable: {
        type: 'boolean',
        default: false,
      },
      isActive: {
        type: 'boolean',
        default: false,
      },
      isActiveFrom: {
        type: 'string',
        default: undefined,
      },
      isActiveTo: {
        type: 'string',
        default: undefined,
      },
      requiredUserRole: {
        type: 'string',
        default: 'member',
      },
      mustConfirm: {
        type: 'boolean',
        default: false,
      },
      withExisting: {
        type: 'enum',
        values: ['error', 'replace', 'merge'],
        default: 'error',
      },
      voteType: {
        type: 'enum',
        values: [
          'likes',
          'count',
          'budgeting',
          'countPerTag',
          'budgetingPerTag',
          'countPerTheme',
          'budgetingPerTheme',
        ],
        default: 'likes',
      },
      voteValues: {
        type: 'arrayOfObjects',
        default: [
          {
            label: 'voor',
            value: 'yes',
          },
          {
            label: 'tegen',
            value: 'no',
          },
        ],
      },
      maxResources: {
        type: 'int',
        default: 100,
      },
      minResources: {
        type: 'int',
        default: 1,
      },
      minBudget: {
        type: 'int',
        default: undefined,
      },
      maxBudget: {
        type: 'int',
        default: undefined,
      },
      themes: {
        type: 'objectList',
        elementSubset: {
          minBudget: {
            type: 'int',
            default: undefined,
          },
          maxBudget: {
            type: 'int',
            default: undefined,
          },
        },
      },
    },
  },

  polls: {
    type: 'object',
    subset: {
      canAddPolls: {
        type: 'boolean',
        default: false,
      },
      requiredUserRole: {
        type: 'string',
        default: 'anonymous',
      },
    },
  },

  widgets: {
    type: 'object',
    subset: {
      beta: {
        type: 'boolean',
        default: false,
      },
      deprecated: {
        type: 'boolean',
        default: false,
      },
      visibleWidgets: {
        type: 'arrayOfStrings',
        default: [],
      },
    },
  },

  map: {
    type: 'object',
    subset: {
      minZoom: {
        type: 'string',
        default: '7',
      },
      maxZoom: {
        type: 'string',
        default: '20',
      },
      areaId: {
        type: 'string',
        default: '0',
      },
    },
  },

  certificates: {
    type: 'object',
    subset: {
      certificateMethod: {
        type: 'enum',
        values: ['cert-manager', 'external'],
        default: 'cert-manager',
      },
      externalCertSlug: {
        type: 'string',
        default: '',
      },
    },
  },

  host: {
    status: null,
  },

  ignoreBruteForce: {
    type: 'arrayOfStrings',
    default: [],
  },

  // Controls which data components are exposed via the /stats reporting API.
  // Each component has an 'enabled' flag and an optional list of personal fields
  // (user-authored text / identifiers) that the admin has explicitly opted in to.
  // Default: all components disabled — a token with no config reaches /stats only.
  // Admin-configured, enforced in the project PUT route (routes/api/project.js):
  // only an admin may change this subtree; resubmitting it unchanged is allowed
  // for any role.
  dataScope: {
    type: 'object',
    subset: {
      resources: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      votes: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      comments: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      submissions: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
          // Separate per-field opt-in allowlist (#440) for the dynamic form
          // answer columns (field_<key>) exposed by /reports/submissions and
          // /reports/submissions/fields. Distinct from personalFields above
          // (which lists fixed, cross-project field names from
          // report-data-scope's static catalog) — form fields are dynamic,
          // defined per widget, so they can't live in that catalog.
          //
          // SCOPE: project-wide per fieldKey, not per widget — opting in
          // 'email' also exposes form B's field_email if B uses that same key.
          // ?widgetId= narrows rows, never the allowlist.
          //
          // Default empty: no form answers are exposed until explicitly
          // opted in per field key.
          formFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      choiceguides: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
          // Per-field opt-in allowlist (#441) for the flattened
          // answer_<key> columns exposed by /reports/choice-guide-results —
          // same rationale as submissions.formFields above (dynamic,
          // per-widget question keys can't live in the static catalog), and
          // the same scope: project-wide per answer key.
          answerFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      projects: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      // ADDITIVE (#441): choice-guide definition content (safe-only, no
      // personalFields — see report-data-scope.js's choiceguideguides /
      // choiceguidequestions comments).
      choiceguideguides: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      choiceguidequestions: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
          personalFields: { type: 'arrayOfStrings', default: [] },
        },
      },
      // ADDITIVE (#442): dedicated toggle for the participant roster
      // (/reports/users/anonymized + /reports/users/aggregates). It spans every
      // data source, so enabling e.g. only 'votes' must not unlock it.
      // Enforced in middleware/api-token-scope-guard.js.
      users: {
        type: 'object',
        subset: {
          enabled: { type: 'boolean', default: false },
        },
      },
    },
  },
};
