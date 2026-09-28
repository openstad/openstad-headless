'use strict';

require('dotenv').config();

const { loadConfig } = require('./src/config');
const { createApp } = require('./src/create-app');

const config = loadConfig();
const app = createApp(config);

// The bound port is read back from the server rather than echoed from config:
// MCP_PORT=0 asks the OS for a free port, so config.port would log a useless 0.
const server = app.listen(config.port, config.host, () => {
  console.log(
    `Openstad reporting MCP server listening on ${config.host}:${server.address().port}`
  );
});
