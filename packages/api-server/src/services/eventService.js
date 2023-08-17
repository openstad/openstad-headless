const jsonLogic = require('json-logic-js');
const notificationService = require('./notificationService')

/**
 * Publish an event
 * This method checks if there is any ruleset available for the published event
 *
 * @param {object} notificationRuleSet
 * @param {int} projectId
 * @param {{resource: string, eventType: string, instance: object}} ruleSetData
 * @returns {Promise<void>}
 */
const publish = async (notificationRuleSet, projectId, ruleSetData) => {

  console.log('Publish event called: ', ruleSetData.resource, ruleSetData.eventType);

  const ruleSets = await notificationRuleSet
    .scope('includeTemplate', 'includeRecipients')
    .findAll({where: { projectId, active: 1}})

  ruleSets.forEach((ruleset) => {
    if (jsonLogic.apply(ruleset.body, ruleSetData) === false) {
      console.log('ruleset doesnt match', ruleset.id, ruleset.body);
      return false;
    }
    console.log('Matched ruleset', ruleSetData.resource, ruleSetData.eventType)
    const { notification_template, notification_recipients } = ruleset;

    const recipients = notification_recipients.map(recipient => {
      const user = {}
      if (recipient.emailType === 'field') {
        // get email field from resource instance, can be dot separated (e.g. submittedData.email)
        user.email = recipient.value.split('.').reduce((o,i)=>o[i], ruleSetData.instance)
      }
      if (recipient.emailType === 'fixed') {
        user.email = recipient.value
      }

      return user;
    });

    if (recipients.length === 0) {
      console.error('No recipients found for ruleset id: ', ruleset.id);
    }

    const emailData = {
      subject: notification_template.subject,
      text: notification_template.text,
      template: notification_template.templateFile,
      ...ruleSetData.instance.get()
    }

    // Todo: instead of directly notify we should use a decent queue
    recipients
      .filter(recipient => recipient.email)
      .forEach(recipient => {
        console.log('Notify recipient', recipient.email);
        notificationService.notify(emailData, recipient, projectId)
      });
  });
}

module.exports = {
  publish
}
