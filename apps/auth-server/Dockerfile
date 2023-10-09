# Image used for building dependencies
FROM node:18-slim as builder

# Create app directory
WORKDIR /opt/auth-server

# Install all base dependencies.# add perl for shell scripts
RUN apt-get update
RUN apt-get install -y python3 make cmake git bash g++

# Install app dependencies
COPY --chown=node:node package*.json .
RUN npm install
RUN npm install -g nodemon

RUN rm -rf /var/cache/apk/*

# Release image 
FROM node:18-slim

# Label for tracking
LABEL nl.openstad.container="auth" nl.openstad.version="0.0.1" nl.openstad.release-date="2023-09-25"

WORKDIR /opt/auth-server

# Environment variables
ENV APP_URL=
ENV ADMIN_REDIRECT_URL=
ENV DB_HOST=
ENV DB_USER=
ENV DB_PASSWORD=
ENV DB_NAME=
ENV MAIL_SERVER_URL=
ENV MAIL_SERVER_PORT=
ENV MAIL_SERVER_SECURE=
ENV MAIL_SERVER_PASSWORD=
ENV MAIL_SERVER_USER_NAME=
ENV EMAIL_ASSETS_URL=
ENV FROM_NAME=
ENV FROM_EMAIL=

# copy files
COPY --chown=node:node --from=builder . /
COPY --chown=node:node . /opt/auth-server
USER node

# The place where the certificates should be:
# certificate.pem  certrequest.csr  privatekey.pem
RUN mkdir -p /opt/auth-server/certs && chown node:node /opt/auth-server/certs
RUN mkdir -p /opt/auth-server/certs4 && chown node:node /opt/auth-server/certs4

VOLUME ["/opt/auth-server/certs"]
VOLUME ["/opt/auth-server/certs4"]

# Owner rights for node user
RUN chown -R node:node /opt/auth-server
RUN chown -R node:node /opt/auth-server/certs
RUN chown -R node:node /opt/auth-server/certs4

# Exposed ports for application
EXPOSE 4000/tcp
EXPOSE 4000/udp

# Run the application
CMD [ "npm", "start" ]
