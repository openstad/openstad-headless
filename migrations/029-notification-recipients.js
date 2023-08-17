'use strict';
const db = require('../src/db').sequelize;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return db.query(`
      CREATE TABLE \`notification_recipients\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`notificationRulesetId\` int(11) NOT NULL,
        \`emailType\` varchar (255) NOT NULL,
        \`value\` varchar(255),            
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        \`deletedAt\` datetime DEFAULT NULL,    
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_notificationRulesetId\` FOREIGN KEY (\`notificationRulesetId\`) REFERENCES \`notification_rulesets\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  },

  down: (queryInterface, Sequelize) => {
    return db.query("DROP TABLE \`notification_recipients\`;");
  }
}
