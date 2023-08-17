const config = require('config');
const mail = require('../lib/mail');

let Notifications = {
  queue: {},
};

Notifications.addToQueue = function(content) {

  let self = this;

  if (!content.type || !content.instanceId) return;

  self.queue[content.type] = self.queue[content.type] || {};
  self.queue[content.type][content.projectId] = self.queue[content.type][content.projectId] || [];
  
  self.queue[content.type][content.projectId].push(content);


}

Notifications.processQueue = function(type) {

  let self = this;
  
  if (self.queue[type]) {

    Object.keys(self.queue[type]).forEach((projectId) => {

      if (self.queue[type][projectId] && self.queue[type][projectId].length) {

        switch(type) {
          case 'comment':
            self.sendNewContentMessage({projectId, type: 'comment', action: 'create', content: self.queue[type][projectId] });
            break;

          case 'idea':
            self.queue[type][projectId].forEach((entry) => {
              self.sendNewContentMessage({projectId, type: 'idea', action: entry.action, content: [entry] });
            });
            break;

          case 'article':
            self.queue[type][projectId].forEach((entry) => {
              self.sendNewContentMessage({projectId, type: 'article', action: entry.action, content: [entry] });
            });
            break;
            
          default: 
        }

        self.queue[type][projectId] = [];

      }

    });

  }

}

Notifications.sendNewContentMessage = function({ projectId, type, action, content }) {

  const db = require('../db'); // looped required

  let self = this;

  // get config
  db.Project.findByPk(projectId)

    .then(project => {

      let myConfig = Object.assign({}, config, project && project.config);

      let data = {};

      data.subject = ( type == 'comment' ? 'Nieuwe comments geplaatst' : ( action == 'create' ? 'Nieuwe inzending geplaatst' : 'Bestaande inzending bewerkt' ) );
      data.PROJECTNAME = ( project && project.title ) || myConfig.projectName;
      data.subject += ' op ' + data.PROJECTNAME;

      data.template = myConfig.notifications && myConfig.notifications.template;

      let instanceIds = content.map( entry => entry.instanceId );
      let model = type.charAt(0).toUpperCase() + type.slice(1);

      let scope = type == 'idea' || type == 'article' ? ['withUser', 'includeProject'] : ['withUser', 'withIdea'];
      db[model].scope(scope).findAll({ where: { id: instanceIds }})
        .then( found => {
          data.data = {};
          data.data[type] = found.map( entry => {
            let json = entry.toJSON();
            if ( type == 'idea' ) {
              let inzendingPath = ( myConfig.ideas && myConfig.ideas.feedbackEmail && myConfig.ideas.feedbackEmail.inzendingPath && myConfig.ideas.feedbackEmail.inzendingPath.replace(/\[\[ideaId\]\]/, entry.id) ) || "/";
              json.inzendingURL = data.URL + inzendingPath;
            }
            if ( type == 'article' ) {
              let inzendingPath = ( myConfig.articles && myConfig.articles.feedbackEmail && myConfig.articles.feedbackEmail.inzendingPath && myConfig.articles.feedbackEmail.inzendingPath.replace(/\[\[articleId\]\]/, entry.id) ) || "/";
              json.inzendingURL = data.URL + inzendingPath;
            }
            return json;
          });
          Notifications.sendMessage({ project, data });
        });

    })

}

Notifications.sendMessage = function({ project, data }) {

  let self = this;
  let myConfig = Object.assign({}, config, project && project.config);

  data.from = data.from || ( myConfig.notifications && myConfig.notifications.fromAddress ) || myConfig.mail.from;
  data.to = data.to || ( myConfig.notifications && myConfig.notifications.projectmanagerAddress );

  data.EMAIL = data.EMAIL || data.from;
  data.HOSTNAME = data.HOSTNAME || ( myConfig.cms && ( myConfig.cms.hostname || myConfig.cms.domain ) ) || myConfig.hostname || myConfig.domain;
  data.URL = data.URL || ( myConfig.cms && myConfig.cms.url ) || myConfig.url || ( 'https://' + data.HOSTNAME );
  data.PROJECTNAME = data.PROJECTNAME || ( project && project.title ) || myConfig.projectName;
  data.ENDDATE = data.endDate || '';
  data.WEBMASTER_EMAIL = data.webmasterEmail;

  data.subject = data.subject || 'Geen onderwerp';
  data.template = data.template;

  mail.sendNotificationMail(data, project);

}

module.exports = Notifications;
