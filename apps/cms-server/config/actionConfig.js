
module.exports = {
    actions: [
        {
            title: 'E-mail',
            name: 'mailOnce',
            formFields: [
                {
                    title: 'Send To:',
                    info: '',
                    fieldKey: 'sendTo',
                    type: 'radio',
                    fieldOptions: [
                        {
                            label: 'User of the event',
                            value: 'user',
                        },
                        {
                            label:'Fixed e-mail address',
                            value: 'fixedEmail',
                        },
                    ],
                    isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'Email Subject',
                    info: '',
                    fieldKey: 'subject',
                    type: 'text',
                   // isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'Email content ',
                    info: 'HTML allowed',
                    fieldKey: 'templateString',
                    type: 'textarea',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'Recipient name',
                    info: '',
                    fieldKey: 'recipientName',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'Recipient email',
                    info: '',
                    fieldKey: 'recipientUserEmail',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'BCC',
                    info: '',
                    fieldKey: 'bcc',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'Reply To',
                    info: '',
                    fieldKey: 'replyTo',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },

            ]
        },
        {
            title: 'Chat message',
            name: 'chatMessage',
            formFields: [
                {
                    title: 'Message',
                    info: 'to use firstname: {{firstName}}, {{lastName}}',
                    fieldKey: 'templateString',
                    type: 'textarea',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
                {
                    title: 'User ID',
                    info: 'Set the user ID of the sender.',
                    fieldKey: 'senderUserId',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
            ]
        },

        {
            title: 'Add to chatgroup',
            name: 'addToChatGroup',
            formFields: [
                {
                    title: 'Chat Group ID',
                    info: 'to use firstname: {{firstName}}, {{lastName}}',
                    fieldKey: 'chatGroupId',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
            ]
        },

        {
            title: 'Remove from chatgroup',
            name: 'removeFromChatGroup',
            formFields: [
                {
                    title: 'Chat Group ID',
                    info: 'to use firstname: {{firstName}}, {{lastName}}',
                    fieldKey: 'chatGroupId',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
            ]
        },

        {
            title: 'Start a program',
            name: 'startProgram',
            formFields: [
                {
                    title: 'Program ID',
                    info: 'Set the program ID for users to start.',
                    fieldKey: 'programId',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
            ]
        },

        {
            title: 'Zapier Post',
            name: 'zapierHookUrl',
            formFields: [
                {
                    title: 'Zapier Hook Url.',
                    info: 'Create the hook url, and set it here. We\'ll post both the users data as well as event data to Zapier.',
                    fieldKey: 'zapierHookUrl',
                    type: 'text',
                    isConfigKey: false,
                    storageKey: 'settings',
                },
            ]
        },

    ],
    events: [
        {
            name: 'signUp',
            label: 'New Subscription',
            formatMessage: () => {

            }
        },
        {
            name: 'productBought',
            label: 'New Product Bought',
            formatMessage: () => {

            }
        },
        {
            name: 'dayFollowingProgram',
            addNumber: '',
            label: 'Certain amount of Days after starting a Program',
            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCancelledapple',
            label: 'Subscription Cancelled Apple',
            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCancelledgoogle',
            formatMessage: () => {

            }
        },
        {
            name: 'weightEntryUpdate',
            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCreatedgoogle',
            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCreatedapple',
            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCreatedmollie',
            formatMessage: () => {

            }
        },
        {
            name: 'workoutDone',

            formatMessage: () => {

            }
        },
        {
            name: 'programSelected',

            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCancelledmollie',

            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionUpdatePlanIdmollie',

            formatMessage: () => {

            }
        },
        {
            name: 'oneTimeAccessStripe',

            formatMessage: () => {

            }
        },
        {
            name: 'buyOneTimeProductgoogle',

            formatMessage: () => {

            }
        },
        {
            name: 'buyOneTimeProductios',

            formatMessage: () => {

            }
        },
        {
            name: 'subscriptionCreatedstripe',
            formatMessage: () => {

            }
        }
    ]

}