module.exports = {

  allowedDomains: {
    type: 'arrayOfStrings',
    default: [
      'api.openstad.org'
    ]
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
      }
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
        default: 'De reactiemogelijkheid is gesloten, u kunt niet meer reageren',
      },
      canReply: {
        type: 'boolean',
        default: true,
      },
      canLike: {
        type: 'boolean',
        default: true,
      },
      descriptionMinLength: {
        type: 'number',
        default: 30,
      },
      descriptionMaxLength: {
        type: 'number',
        default: 500,
      },
    }
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
        values: ['likes', 'count', 'budgeting', 'countPerTag', 'budgetingPerTag', 'countPerTheme', 'budgetingPerTheme'],
        default: 'likes',
      },
      voteValues: {
        type: 'arrayOfObjects',
        default: [
          {
            label: 'voor',
            value: 'yes'
          },
          {
            label: 'tegen',
            value: 'no'
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
        }
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
    type: "object",
    subset: {
      beta: {
        type: "boolean",
        default: false
      },
      deprecated: {
        type: "boolean",
        default: false
      },
      visibleWidgets: {
        type: "arrayOfStrings",
        default: []
      }
    }
  },

  map: {
    type: "object",
    subset: {
      minZoom: {
        type: "string",
        default: '7',
      },
      maxZoom: {
        type: "string",
        default: '20',
      },
      areaId: {
        type: 'string',
        default: '0',
      }
    }
  },
  
  host: {
    status: null,
  },

  ignoreBruteForce: {
    type: 'arrayOfStrings',
    default: []
  },

};
