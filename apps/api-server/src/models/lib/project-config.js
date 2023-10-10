module.exports = {

  allowedDomains: {
    type: 'arrayOfStrings',
    default: [
      'openstad-api.amsterdam.nl'
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

  basicAuth: {
    type: 'object',
    subset: {
      active: {
        type: 'boolean',
        default: false,
      },
      user: {
        type: 'string',
        default: 'openstad',
      },
      password: {
        type: 'string',
        default: 'LqKNcKC7',
      },
    }
  },

  cms: {
    type: 'object',
    subset: {
      url: {
        type: 'string',
        default: 'https://openstad-api.amsterdam.nl',
      },
      hostname: {
        type: 'string',
        default: 'openstad-api.amsterdam.nl',
      },
      'after-login-redirect-uri': {
        type: 'string',
        default: '/oauth/login?jwt=[[jwt]]',
      },
      "redirectURI": {
        type: 'string',
        default: undefined,
      },
      "widgetDisplaySettings": {
        "type": "object",
        "subset": {
          "beta": {
            "type": "boolean",
            "default": false
          },
          "deprecated": {
            "type": "boolean",
            "default": false
          },
          "visibleWidgets": {
            "type": "arrayOfStrings",
            "default": []
          }
        }
      }
    }
  },

  'auth': {
    type: 'object',
    subset: {
      default: {
        type: 'string',
        default: 'openstad',
      },
      provider: {
        type: 'objectsInObject',
        //            subset: {
        //              "auth-server-url": {
        //                type: 'string',
        //              },
        //              "auth-client-id": {
        //                type: 'string',
        //              },
        //              "auth-client-secret": {
        //                type: 'string',
        //              },
        //              "auth-server-login-path": {
        //                type: 'string',
        //              },
        //              "auth-server-exchange-code-path": {
        //                type: 'string',
        //              },
        //              "auth-server-get-user-path": {
        //                type: 'string',
        //              },
        //              "auth-server-logout-path": {
        //                type: 'string',
        //              },
        //              "after-login-redirect-uri": {
        //                type: 'string',
        //              }
        //            }
      }
    },
  },

  ideas: {
    type: 'object',
    subset: {
      canAddNewIdeas: {
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
      extraDataMustBeDefined: {
        type: 'boolean',
        default: false,
      },
      extraData: {
        type: 'object',
      },
      types: {
        type: 'arrayOfObjects',
        default: [],
        subset: {
          name: {
            type: 'string',
            default: 'noName',
          },
          label: {
            type: 'label',
            default: 'Dit is niets',
          },
          auth: {
            type: 'object', // TODO: werk dit uit
          },
          mapIcon: {
            type: 'string',
            default: '',
          },
          listIcon: {
            type: 'string',
            default: '',
          },
          buttonIcon: {
            type: 'string',
            default: '',
          },
          buttonLabel: {
            type: 'string',
            default: '',
          },
          backgroundColor: {
            type: 'string',
            default: '#164995',
          },
          textColor: {
            type: 'string',
            default: 'white',
          },
          // TODO: deze komen uit cms thema; werk dat verder uit
          "flag": {type: 'string', default: ''},
          "mapUploadedFlag": {type: 'string', default: ''},
          "mapFlagWidth": {type: 'string', default: ''},
          "mapFlagHeight": {type: 'string', default: ''},
          "Initialavailablebudget": {type: 'int', default: 0},
          "minimalBudgetSpent": {type: 'int', default: 0},
        }
      },
      automaticallyUpdateStatus: {
        isActive: {
          type: 'boolean',
          default: false,
        },
        afterXDays: {
          type: 'int',
          default: 90,
        },
      },
    }
  },

  comments: {
    type: 'object',
    subset: {
      new: {
        type: 'object',
        subset: {
          anonymous: {
            type: 'object',
            subset: {
              redirect: {
                type: 'string',
                default: null,
              },
              notAllowedMessage: {
                type: 'string',
                default: null,
              }
            }
          },
          showFields: {
            type: 'arrayOfStrings', // eh...
            default: ['zipCode', 'displayName'],
          }
        }
      },
      isClosed: {
        type: 'boolean',
        default: false,
      },

      closedText: {
        type: 'string',
        default: 'De reactiemogelijkheid is gesloten, u kunt niet meer reageren',
      },

    }
  },

  users: {
    type: 'object',
    subset: {
      extraDataMustBeDefined: {
        type: 'boolean',
        default: false,
      },
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
        default: null,
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
        values: ['likes', 'count', 'budgeting', 'count-per-theme', 'budgeting-per-theme'],
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

      maxIdeas: {
        type: 'int',
        default: 100,
      },

      minIdeas: {
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

  articles: {
    type: 'object',
    subset: {
      canAddNewArticles: {
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
      canEditAfterFirstLikeOrComment: {
        type: 'boolean',
        default: false,
      },
      extraDataMustBeDefined: {
        type: 'boolean',
        default: false,
      },
      extraData: {
        type: 'object',
      }
    }
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

  newslettersignup: {
    type: 'object',
    subset: {
      isActive: {
        type: 'boolean',
        default: false,
      },
      autoConfirm: {
        type: 'boolean',
        default: false,
      },
    },
  },

  host: {
    status: null,
  },

  ignoreBruteForce: {
    type: 'arrayOfStrings',
    default: []
  },

  styling: {
    type: 'object',
    subset: {
      logo: {
        type: 'string',
        default: '',
      },
    },
  }

};
