# Image used for building dependencies
FROM node:16.16.0-alpine as builder

# Create app directory
WORKDIR /opt/api-server

# Install all base dependencies.# add perl for shell scripts
RUN apk add --no-cache --update g++ make python3 musl-dev bash perl perl-dbd-mysql perl-posix-strftime-compiler

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories
RUN apk update
RUN apk add mongodb=3.4.4-r0
RUN apk add mongodb-tools

# Install app dependencies
COPY --chown=node:node package*.json .
RUN npm install
RUN npm install -g nodemon

# Remove unused packages only used for building.
RUN apk del g++ make python3 && rm -rf /var/cache/apk/*

# Release image 
FROM node:16.16.0-alpine

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
ENV API_EXPRESS_PORT=""
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
