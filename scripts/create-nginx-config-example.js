const fs = require('fs');

module.exports = async function createNginxConfigExample() {

  let nginxConfigExample = `# ----------------------------------------------------------------------------------------------------
# API

server {
  listen 80;
  server_name ${process.env.API_DOMAIN};
 
  client_max_body_size 20M;

  location / {
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_pass http://localhost:${process.env.API_PORT};
  }
 
}

# ----------------------------------------------------------------------------------------------------
# auth

server {
  listen 80;
  server_name ${process.env.AUTH_DOMAIN};

  client_max_body_size 20M;

  location / {
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_pass http://localhost:${process.env.AUTH_PORT};
  }
 
}

# ----------------------------------------------------------------------------------------------------
# image server

server {
  listen 80;
  server_name ${process.env.IMAGE_DOMAIN};

  client_max_body_size 20M;

  location / {
    proxy_redirect off;
    proxy_set_header Host $host;
    proxy_pass http://localhost:${process.env.IMAGE_PORT_API};
  }
 
}
`;

  try {
    console.log('==============================');
    console.log('Create nginx config example file');
    await fs.writeFileSync('./nginx.config.example', nginxConfigExample );
  } catch (err) {
    console.log(err);
  }

}
  
