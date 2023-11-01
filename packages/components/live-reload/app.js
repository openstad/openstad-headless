const express = require("express");
const path = require("path");

const app = express();

const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  let livereload = require("livereload");
  let connectLiveReload = require("connect-livereload");

  let liveReloadServer = livereload.createServer({
  });

  liveReloadServer.watch(path.join(__dirname, '..', "dist"));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLiveReload({
  }));

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.listen(3333)
  

  
  console.log('App running');
} else {
  console.log('Server not available in production');
}

