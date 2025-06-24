# Image used for building dependencies
FROM node:18-slim AS builder
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
COPY --chown=node:node apps/ ./apps

RUN npm config set fetch-retry-maxtimeout 300000
RUN npm config set fetch-retry-mintimeout 60000
RUN npm config set fetch-timeout 300000

ARG BUILD_ENV=production
ENV BUILD_ENV=${BUILD_ENV}

RUN npm install --legacy-peer-deps -ws

FROM builder AS base

ARG APP
ENV WORKSPACE=apps/${APP}

RUN npm run build-packages --if-present -w $WORKSPACE

RUN npm cache clean --force

# Remove all folders from ./apps except the one specified by APP
RUN find ./apps -mindepth 1 -maxdepth 1 -type d ! -name "${APP}" -exec rm -rf {} +
RUN npm prune -ws


# Development image
FROM base AS development
ENV NODE_ENV=${NODE_ENV:-development}
# Create app directory
WORKDIR /opt/openstad-headless

# Generate and store release ID dynamically
# Alleen uitvoeren voor de cms-server
RUN if [ "$APP" = "cms-server" ]; then \
      releaseId=$(node -e "console.log(require('./apps/cms-server/apos-build/release-id.json').releaseId)"); \
      echo "APOS_RELEASE_ID=$releaseId" >> /opt/openstad-headless/.env; \
    else \
      echo "Skipping APOS_RELEASE_ID for $APP"; \
    fi

CMD ["npm", "run", "dev", "-w", "${WORKSPACE}"]

# Prepare production
FROM base AS prepare-production
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}
RUN npm run build --if-present -w $WORKSPACE
RUN npm prune -ws --production

# Release image
FROM node:18-slim AS release
ARG APP
ARG PORT
ARG NODE_ENV
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
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/package.json ./package.json

USER node

EXPOSE ${PORT}

CMD ["npm", "run", "start", "-w", "${WORKSPACE}"]

# Release image with additional packages if needed
FROM release AS release-with-packages

WORKDIR /opt/openstad-headless

# Copy the shared packages from the prepare-production stage
COPY --from=prepare-production --chown=node:node /opt/openstad-headless/packages ./packages

USER node

EXPOSE ${PORT}

# Run the application
CMD ["npm", "run", "start", "-w", "${WORKSPACE}"]
