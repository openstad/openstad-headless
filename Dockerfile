# Image used for building dependencies
FROM node:18-slim as builder
ARG APP
ENV WORKSPACE apps/${APP}

LABEL org.opencontainers.image.source=https://github.com/${GITHUB_REPOSITORY}

# Create app directory
WORKDIR /opt/openstad-headless

# Install all base dependencies.# add perl for shell scripts
RUN apt-get update && \
    apt-get install -y python3 make cmake git bash g++

# Install app dependencies
COPY --chown=node:node package*.json .
# Bundle all packages during build, only the installed once will persist
COPY --chown=node:node packages/ ./packages
COPY --chown=node:node apps/$APP ./apps/$APP

RUN npm install --prefix=$WORKSPACE
# Disabled for now since the admin/web server won't build due to errors
# && \
#     npm run build --prefix=@openstad-headless/${APP} --if-present

# Development image
FROM builder as development
ARG APP
ENV WORKSPACE apps/${APP}
CMD ["npm", "run", "dev", "--prefix=${WORKSPACE}"]

# Release image
FROM node:18-slim as release
ARG APP
ARG PORT
ENV WORKSPACE apps/${APP}

WORKDIR /opt/openstad-headless

# copy filesc
COPY --chown=node:node apps/${APP} /opt/openstad-headless/apps/${APP}

RUN npm --prefix=apps/${APP} prune --production

USER node

EXPOSE ${PORT}

# Run the application
CMD ["npm", "run", "start", "--prefix=${WORKSPACE}"]
