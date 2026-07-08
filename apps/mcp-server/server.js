'use strict';

require('dotenv').config();

const { loadConfig } = require('./src/config');
const { createApp } = require('./src/create-app');

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, config.host, () => {
  console.log(
    `Openstad reporting MCP server listening on ${config.host}:${config.port} (project ${config.projectId})`
  );
});
