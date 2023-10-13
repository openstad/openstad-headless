# Image used for building dependencies
FROM node:18-slim as builder

# Create app directory
WORKDIR /opt/api-server

# Install all base dependencies.# add perl for shell scripts
RUN apt-get update
RUN apt-get install -y python3 make cmake git bash g++

# Install app dependencies
COPY --chown=node:node package*.json .
RUN npm install
RUN npm install -g nodemon

# Release image 
FROM node:18-slim

# Label for tracking
LABEL nl.openstad.container="api" nl.openstad.version="0.0.1" nl.openstad.release-date="2023-09-25"

WORKDIR /opt/api-server

# Environment variables
ENV API_URL=""
ENV API_HOSTNAME=""
ENV API_DATABASE_USER=""
ENV API_DATABASE_PASSWORD=""
ENV API_DATABASE_DATABASE=""
ENV API_DATABASE_HOST=""
ENV API_EMAILADDRESS=""
ENV API_PORT=""
ENV API_MAIL_FROM=""
ENV API_MAIL_TRANSPORT_SMTP_PORT=""
ENV API_MAIL_TRANSPORT_SMTP_HOST=""
ENV API_MAIL_TRANSPORT_SMTP_REQUIRESSL=""
ENV API_MAIL_TRANSPORT_SMTP_AUTH_USER=""
ENV API_MAIL_TRANSPORT_SMTP_AUTH_PASS=""
ENV API_NOTIFICATIONS_ADMIN_EMAILADDRESS=""
ENV API_AUTHORIZATION_JWTSECRET=""
ENV API_AUTHORIZATION_FIXEDAUTHTOKENS=""
ENV AUTH_API_URL=""

# copy files
COPY --chown=node:node --from=builder . /
COPY --chown=node:node . /opt/api-server
USER node

# Set node ownership to /home/app
RUN chown -R node:node /opt/api-server

# Exposed ports for application
EXPOSE 8111/tcp
EXPOSE 8111/udp

# Run the application
CMD [ "npm", "start" ]
