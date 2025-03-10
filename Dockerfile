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

RUN npm config set fetch-retry-maxtimeout 300000
RUN npm config set fetch-retry-mintimeout 60000
RUN npm config set fetch-timeout 300000

ARG BUILD_ENV=production
ENV BUILD_ENV=${BUILD_ENV}

# Retry logic for npm install and build-packages if BUILD_ENV is local
RUN if [ "$BUILD_ENV" = "local" ]; then \
    n=0; \
    until [ "$n" -ge 5 ]; do \
        npm install -w $WORKSPACE && break; \
        n=$((n+1)); \
        echo "Retrying npm install... attempt $n"; \
        sleep 5; \
    done; \
    n=0; \
    until [ "$n" -ge 5 ]; do \
        npm run build-packages --if-present --prefix=$WORKSPACE && break; \
        n=$((n+1)); \
        echo "Retrying build-packages... attempt $n"; \
        sleep 5; \
    done; \
else \
    npm install -w $WORKSPACE && \
    npm run build-packages --if-present --prefix=$WORKSPACE; \
fi

RUN npm cache clean --force

# Generate and store release ID dynamically
# Alleen uitvoeren voor de cms-server
RUN if [ "$APP" = "cms-server" ]; then \
      releaseId=$(node -e "console.log(require('./apps/cms-server/apos-build/release-id.json').releaseId)"); \
      echo "APOS_RELEASE_ID=$releaseId" >> /opt/openstad-headless/.env; \
    else \
      echo "Skipping APOS_RELEASE_ID for $APP"; \
    fi

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
