'use strict';
const db = require('../src/db').sequelize;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return db.query(`
      CREATE TABLE \`notification_templates\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`label\` varchar(255) NOT NULL,
        \`subject\` varchar(255)  NOT NULL,
        \`text\` text NOT NULL,
        \`templateFile\` varchar(255) NOT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        \`deletedAt\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  },

  down: (queryInterface, Sequelize) => {
    return db.query("DROP TABLE \`notification_templates\`;");
  }
}
