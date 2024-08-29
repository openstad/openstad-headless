# Image used for building dependencies
FROM node:18-slim AS builder
ARG APP
ENV WORKSPACE=apps/${APP}
ENV GITHUB_REPOSITORY=openstad/openstad-headless

LABEL org.opencontainers.image.source=https://github.com/${GITHUB_REPOSITORY}

# Create app directory
WORKDIR /opt/openstad-headless

# Install all base dependencies.# add perl for shell scripts
RUN apt-get update && \
    apt-get install -y python3 make cmake git bash g++

RUN npm update -g npm

# Install app dependencies
COPY --chown=node:node package*.json .
# Bundle all packages during build, only the installed once will persist
COPY --chown=node:node packages/ ./packages
COPY --chown=node:node apps/$APP ./apps/$APP

RUN npm install -w $WORKSPACE

RUN npm run build-packages --if-present --prefix=$WORKSPACE

# Disabled for now since the admin/web server won't build due to errors
# && \
#     npm run build --prefix=@openstad-headless/${APP} --if-present

# Development image
FROM builder AS development
ARG APP
ENV WORKSPACE apps/${APP}
# Create app directory
WORKDIR /opt/openstad-headless

CMD ["npm", "run", "dev", "--prefix=${WORKSPACE}"]

# Prepare production
FROM builder AS prepare-production
ARG APP
ENV WORKSPACE=apps/${APP}
RUN npm --prefix=apps/${APP} run build --if-present && \
    npm --prefix=apps/${APP} prune --production

# Release image
FROM node:18-slim AS release
ARG APP
ARG PORT
ENV WORKSPACE=apps/${APP}

WORKDIR /opt/openstad-headless

RUN apt-get update && \
    apt-get install -y netcat-traditional && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# copy files
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/apps/${APP} ./apps/${APP}

USER node

EXPOSE ${PORT}

# Run the application
CMD ["npm", "run", "start", "--prefix=${WORKSPACE}"]

FROM release AS release-with-packages
ARG APP
ARG PORT
ENV WORKSPACE=apps/${APP}

WORKDIR /opt/openstad-headless

# copy files
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/packages ./packages

USER node

EXPOSE ${PORT}

# Run the application
CMD ["npm", "run", "start", "--prefix=${WORKSPACE}"]
