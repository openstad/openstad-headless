#!/bin/bash

mysql -u root -p$MYSQL_ROOT_PASSWORD -D $AUTH_DB_NAME --execute \
"SET NAMES utf8mb4;

DROP TABLE IF EXISTS \`access_tokens\`;
DROP TABLE IF EXISTS \`action_log\`;
DROP TABLE IF EXISTS \`clients\`;
DROP TABLE IF EXISTS \`external_csrf_tokens\`;
DROP TABLE IF EXISTS \`login_tokens\`;
DROP TABLE IF EXISTS \`migrations\`;
DROP TABLE IF EXISTS \`password_reset_tokens\`;
DROP TABLE IF EXISTS \`roles\`;
DROP TABLE IF EXISTS \`users\`;
DROP TABLE IF EXISTS \`unique_codes\`;
DROP TABLE IF EXISTS \`user_roles\`;

CREATE TABLE \`access_tokens\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`tokenId\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`userID\` int NOT NULL,
  \`clientID\` int NOT NULL,
  \`scope\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`expirationDate\` datetime DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`action_log\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`method\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`action\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`name\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`value\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`ip\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`userId\` int DEFAULT NULL,
  \`clientId\` int DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`clients\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`redirectUrl\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`description\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`clientId\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`clientSecret\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`authTypes\` json NOT NULL,
  \`exposedUserFields\` json DEFAULT NULL,
  \`requiredUserFields\` json DEFAULT NULL,
  \`allowedDomains\` json DEFAULT NULL,
  \`config\` json DEFAULT NULL,
  \`twoFactorRoles\` json DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`external_csrf_tokens\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`token\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`used\` int NOT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`login_tokens\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`token\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`userId\` int NOT NULL,
  \`valid\` int NOT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`migrations\` (
  \`name\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (\`name\`),
  UNIQUE KEY \`name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

CREATE TABLE \`password_reset_tokens\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`token\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`userId\` int NOT NULL,
  \`valid\` int NOT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`roles\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`users\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`email\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`phoneNumber\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`hashedPhoneNumber\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`phoneNumberConfirmed\` tinyint(1) DEFAULT NULL,
  \`streetName\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`houseNumber\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`city\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`suffix\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`postcode\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`password\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`resetPasswordToken\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`twoFactorToken\` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`twoFactorConfigured\` int DEFAULT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`unique_codes\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`code\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`userId\` int DEFAULT NULL,
  \`clientId\` int NOT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`user_roles\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`clientId\` int NOT NULL,
  \`userId\` int NOT NULL,
  \`roleId\` int NOT NULL,
  \`createdAt\` datetime NOT NULL,
  \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`clientId\` (\`clientId\`),
  KEY \`userId\` (\`userId\`),
  KEY \`roleId\` (\`roleId\`),
  CONSTRAINT \`user_roles_ibfk_1\` FOREIGN KEY (\`clientId\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`user_roles_ibfk_2\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`user_roles_ibfk_3\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"
