const config = require('config')
    , log = require('debug')('app:user')
    , pick = require('lodash/pick');
const Sequelize = require('sequelize')
const {Op} = require('sequelize')
const _ = require('lodash');
const moment = require('moment')

const Url = require('url');

var sanitize = require('../util/sanitize');
const htmlToText = require('html-to-text');

module.exports = function (db, sequelize, DataTypes) {
    var Action = sequelize.define('action', {
        projectId: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        accountId: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
            allowNull: false
        },

        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        name: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },

        type: {
            type: DataTypes.ENUM('continuously', 'once'),
            defaultValue: 'once'
        },

        runDate: {
            type: DataTypes.DATE,
            allowNull: false
        },

        finished: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        },

        settings: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },

        conditions: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
        },

        action: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
    }, {
        charset: 'utf8',
        validate: {},
    });


    Action.auth = Action.prototype.auth = {
        listableBy: 'admin',
        viewableBy: 'admin',
        createableBy: 'admin',
        updateableBy: 'admin',
        deleteableBy: 'admin',
    }


    Action.scopes = function scopes() {
        return {
            includeProject: {
                include: [{
                    model: db.Project,
                }]
            },
        }
    }

    Action.associate = function (models) {
        this.belongsTo(models.User, {constraints: false, onDelete: 'CASCADE'});
    }

    Action.types = [

        /***
         * models can be updated
         */
        {
            name: 'updateModel',
            act: async (action, instance, req, res) => {

                const {
                    keyToUpdate,
                    newValue
                } = action.settings;

                if (!keyToUpdate) {
                    throw new Error('No keyToUpdate was defined for updateModel');
                }

                if (typeof newValue === 'undefined') {
                    throw new Error('No newValue was defined for updateModel');
                }

                const updates = {};
                let pointer = updates;

                keyToUpdate.split('.').map((key, index, arr) => {
                    pointer = (pointer[key] = (index == arr.length - 1 ? newValue : {}))
                });

                let instanceData = instance.toJSON();
                instanceData = _.merge(instanceData, updates);


                instance
                    .update(instanceData)
                    .then(result => {
                        console.log('Succesful updateModel action');
                    })
                    .catch((err) => {

                    });
            }
        },
    ]

    Action.prototype.getSelection = async (action, checkFromDate) => {
        let selection = [];

        if (!action.conditions) {
            return selection;
        }


        /**
         * Example:
         * {
         *     model: 'Comment',
         *     event: 'create'
         * },
         * {
         *     model: 'Account',
         *     event: 'after',
         *     hours: 158,
         *     filters: [
         *         {
         *             key: "status",
         *             value: "trial"
         *         }
         *     ]
         * },
         *
         */
        const conditions = action.conditions;
        const projectId = action.projectId;
        const modelName = conditions.model;
        const dateSelection = conditions.dateSelection;
        const filters = conditions.filters;
        const hours = conditions.hours;
        let where = {};

        if (!db[modelName]) {
            throw new Error(`Model defined as ${modelName} in conditions of action with id ${action.id} doesn't exists.`)
        }


        /**
         * @todo Scenario's after 7 days set a model to new status
         */
        switch (dateSelection) {
            case 'create':
                // Sequelize.literal('NOW() - INTERVAL \'7d\'')
                where = {
                    'createdAt': {
                        [Op.lte]: checkFromDate
                    }
                }
                break;
            case 'afterDate':
                where = {
                    'createdAt': {
                        [Op.lte]: checkFromDate
                    }
                }
                break;
            case 'afterCreate':
                const escapedAfter = sequelize.escape(`${hours}`);

                where = {
                    'createdAt': {
                        [Op.lte]: Sequelize.literal(`DATE_SUB(NOW(), INTERVAL ${escapedAfter} HOUR)`),
                        // add the date check to make sure
                        [Op.lte]: checkFromDate,
                    }
                }
                break;
            case 'update':
                where = {
                    'updatedAt': checkFromDate
                }

                break;

            default:
            //throw new Error(`Event defined as ${modelName} in conditions of action with id ${action.id}`)
        }

        // add filters to where object
        // so for instance filters can be [{key: 'status', value: 'PUBLISHED'}]
        // currently only = operator, but easy to add more when needed
        // for most cases a projectId is wanted, so for

        if (filters) {
            filters.forEach((filter) => {
                where[filter.key] = filter.value;
            })
        }

        // for some models projectId is not referenced directly, for instance comments,
        // so in this case current implementations in not sufficient
        if (!projectId) {
            throw new Error(`No projectId defined, action only allowed to run within a project scope for security and data bug prevention`)
        }

        where[modelName === 'Project' ? 'id' : 'projectId'] = projectId;

        selection = await db[modelName].findAll({
            where: where
        });

        return selection;
    };

    Action.run = async (req, res) => {
        let currentRun;

        try {
            const self = this;

            // Get last run
            const lastRun = await db.ActionRun.findOne({
                order: [['createdAt', 'DESC']],
            });

            const afterCreationDate = lastRun ? moment(lastRun.createdAt).add(30, "minutes") : moment().add(-30, "minutes");
            const reasonableTimeAfterCreation = moment().isAfter(afterCreationDate);

            // if in some case a status running gets stuck make sure after certain time the actions
            // the reasons why it's blocking is because we want to prevent double action execution
            if (lastRun && lastRun.status === 'running' && !reasonableTimeAfterCreation) {
                throw new Error(`Last run with id ${lastRun.id} still has status running, new run not starting`);
                return;
            }

            // if it fails before we get to the end, currently the run will be stuck, need to have a self healing
            // mechanism, or report option
            currentRun = await db.ActionRun.create({
                status: 'running',
            });

            // instance, action, lastCheck
            // trigger, instance created
            // Get last run date, or now, don't leave blanco otherwise a run can target all previous instances
            // Running actions on lots of rows in the past. In same cases that might desired, but is not default behaviour
            const lastRunDate = lastRun ? lastRun.createdAt : new Date().toISOString().slice(0, 19).replace('T', ' ');

            const actions = await db.Action.findAll({
                where: {
                    status: 'active',
                    //only fetch items that are always running
                    [Op.or]: [
                        {
                            type: 'continuously'
                        },
                        {
                            type: 'once',
                            finished: false,
                            runDate: {
                                [Op.lte]: Sequelize.literal('NOW()'),
                            }
                        }
                    ]
                },
                order: [['priority', 'DESC'], ['createdAt', 'DESC']],
            })

            for (var i = 0; i < actions.length; i++) {
                const action = actions[i];

                const actionType = db.Action.types.find(actionType => actionType.name === action.action);

                if (!actionType) {
                    throw new Error(`Action type ${action.type} not found in ActionSequence with id ${self.id}`);
                }

                // array, can be one or more
                const selectionToActUpon = await action.getSelection(action, lastRunDate);

                console.log('selectionToActUpon', selectionToActUpon);

                // there are also actions where all the instances should be bundled, or treated as one
                for (var j = 0; j < selectionToActUpon.length; j++) {
                    const selectedInstance = selectionToActUpon[j];

                    try {
                        // cron runs req, res will be empty, this will cause request actions to fail in case people try to run them as cron
                        // which is perfectly fine, the act method should properly display an error here.
                        await actionType.act(action, selectedInstance, req, res);

                        if (action.type === 'once') {
                            await action.update({
                                finished: true
                            });
                        }

                        await db.ActionLog.create({
                            actionId: action.id,
                            // settings: settings,
                            status: 'success'
                        });
                    } catch (e) {
                        console.log('Errror: ', e)
                        try {
                            await db.ActionLog.create({
                                actionId: action.id,
                                //  settings: settings,
                                status: 'error'
                            });
                        } catch (e) {
                            console.log('Errror in creating ActionLog ', e)
                        }
                    }
                }
            }


            await currentRun.update({status: 'finished'});
        } catch (e) {
            console.log('Error in action run ', e)
            if (currentRun) {
                const currentRunId = currentRun ? currentRun.id : '';
                const errorMessage = 'Error while executing ActionSequence with id ' + currentRunId + ' with the following error: ' + e;

                console.log('errorMessage', errorMessage)

                await currentRun.update({
                    status: 'errored',
                    message: errorMessage
                });
            }
        }
    }

    return Action;
};
