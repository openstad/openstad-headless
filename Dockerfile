# Image used for building dependencies
FROM node:18-slim AS builder
ARG APP
ENV WORKSPACE=apps/${APP}
ENV GITHUB_REPOSITORY=openstad/openstad-headless

LABEL org.opencontainers.image.source=https://github.com/${GITHUB_REPOSITORY}

# Create app directory
WORKDIR /opt/openstad-headless

# Install all base dependencies and clean up unnecessary files after installation
RUN apt-get update && \
    apt-get install -y python3 make cmake git bash g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm update -g npm

# Install app dependencies
COPY --chown=node:node package*.json .
# Bundle all packages during build, only the installed ones will persist
COPY --chown=node:node packages/ ./packages
COPY --chown=node:node apps/$APP ./apps/$APP

RUN npm install -w $WORKSPACE

RUN npm run build-packages --if-present --prefix=$WORKSPACE

# Development image
FROM builder AS development
ENV NODE_ENV=${NODE_ENV:-development}
# Create app directory
WORKDIR /opt/openstad-headless

CMD ["npm", "run", "dev", "--prefix=${WORKSPACE}"]

# Prepare production
FROM builder AS prepare-production
ENV NODE_ENV=${NODE_ENV:-production}
RUN npm --prefix=$WORKSPACE run build --if-present && \
    npm --prefix=$WORKSPACE prune --production

# Release image
FROM node:18-slim AS release
ARG APP
ARG PORT
ENV WORKSPACE=apps/${APP}
ENV NODE_ENV=${NODE_ENV:-production}

WORKDIR /opt/openstad-headless

# Install only necessary system dependencies for runtime and clean up unnecessary files
RUN apt-get update && \
    apt-get install -y netcat-traditional && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the built app from the prepare-production stage
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/apps/${APP} ./apps/${APP}
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/node_modules ./node_modules

USER node

EXPOSE ${PORT}

CMD ["npm", "run", "start", "--prefix=${WORKSPACE}"]

# Release image with additional packages if needed
FROM release AS release-with-packages

WORKDIR /opt/openstad-headless

# Copy the shared packages from the prepare-production stage
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/packages ./packages

USER node

EXPOSE ${PORT}

# Run the application
CMD ["npm", "run", "start", "--prefix=${WORKSPACE}"]
