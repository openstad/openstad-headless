# Image used for building dependencies
FROM node:16.16-slim as builder

# Create app directory
WORKDIR /opt/image-server

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
LABEL nl.openstad.container="image" nl.openstad.version="0.0.1" nl.openstad.release-date="2023-09-25"

WORKDIR /opt/image-server

# Environment variables
ENV APP_URL=http://openstad-image-server
ENV PORT_API=20050
ENV PORT_IMAGE_SERVER=20051
ENV DB_HOST=
ENV DB_USER=
ENV DB_PASSWORD=
ENV DB_NAME=
ENV IMAGES_DIR=/opt/image-server/images
ENV THROTTLE=true
ENV THROTTLE_CC_PROCESSORS=4
ENV THROTTLE_CC_PREFETCHER=20
ENV THROTTLE_CC_REQUESTS=100
ENV S3_ENDPOINT=
ENV S3_KEY=
ENV S3_SECRET=
ENV S3_BUCKET=

# images dir
RUN mkdir -p /opt/image-server/images
RUN chown node:node /opt/image-server/images

# copy files
COPY --chown=node:node --from=builder . /
COPY --chown=node:node . /opt/image-server
USER node

VOLUME /opt/image-server/images

# Run the application
CMD [ "npm", "start" ]




