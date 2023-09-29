# Image used for building dependencies
FROM node:16.16-slim as builder

# Create app directory
WORKDIR /opt/admin-server

# Install app dependencies
COPY --chown=node:node package*.json .
RUN apt-get update
RUN apt-get install -y python3 make cmake git bash g++
RUN npm config set unsafe-perm true
RUN npm install --no-optional --legacy-peer-deps
RUN npm install -g nodemon

# Release image 
FROM node:16.16-slim

# Label for tracking
LABEL nl.openstad.container="admin" nl.openstad.version="0.0.1" nl.openstad.release-date="2023-09-25"

WORKDIR /opt/admin-server

# Environment variables
ENV NEXTAUTH_URL=http://openstad-admin-server
ENV NEXTAUTH_SECRET=
ENV CLIENT_ID=
ENV CLIENT_SECRET=
ENV OAUTH_URL=
ENV API_URL=

# copy files
COPY --chown=node:node --from=builder . /
COPY --chown=node:node . /opt/admin-server
USER node

VOLUME /opt/admin-server/images

# Run the application
CMD [ "npm", "start" ]




