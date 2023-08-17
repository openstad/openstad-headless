'use strict';
const db = require('../src/db').sequelize;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return db.query(`
      CREATE TABLE \`notification_rulesets\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`siteId\` int(11) NOT NULL,
        \`notificationTemplateId\` int(11) NOT NULL,
        \`active\` tinyint(1) NOT NULL,
        \`label\` varchar(255) NOT NULL,
        \`body\` JSON NOT NULL,    
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        \`deletedAt\` datetime DEFAULT NULL,    
        PRIMARY KEY (\`id\`),
        CONSTRAINT FK_notificationTemplateId FOREIGN KEY (\`notificationTemplateId\`) REFERENCES notification_templates(\`id\`) ON DELETE CASCADE,
        CONSTRAINT FK_notificationRuleSetSiteId FOREIGN KEY (\`siteId\`) REFERENCES sites(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  },

  down: (queryInterface, Sequelize) => {
    return db.query("DROP TABLE \`notification_rulesets\`;");
  }
}
