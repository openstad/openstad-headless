'use strict';
const db = require('../src/db').sequelize;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return db.query(`
      CREATE TABLE \`notifications\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`subject\` varchar(255) NOT NULL,
        \`status\` varchar(255)  NOT NULL,
        \`to\` varchar(255) NOT NULL,
        \`type\` varchar(255) NOT NULL,    
        \`body\` text NOT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        \`deletedAt\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  },

  down: (queryInterface, Sequelize) => {
    return db.query("DROP TABLE \`notifications\`;");
  }
}
