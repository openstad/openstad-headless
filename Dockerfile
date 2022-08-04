FROM node:16.16.0-alpine

# Label for tracking
LABEL nl.openstad.container="auth" nl.openstad.version="0.0.1-beta" nl.openstad.release-date="2020-05-07"


# full host url `http://example.com:port`
ENV APP_URL=""

# Frontend URL variable
ENV ADMIN_REDIRECT_URL=""

# MySQL database variables
ENV DB_HOST=""
ENV DB_USER=""
ENV DB_PASSWORD=""
ENV DB_NAME=""

# Mail variables
ENV MAIL_SERVER_URL=""
ENV MAIL_SERVER_PORT=""
ENV MAIL_SERVER_SECURE=""
ENV MAIL_SERVER_PASSWORD=""
ENV MAIL_SERVER_USER_NAME=""
ENV EMAIL_ASSETS_URL=""
ENV FROM_NAME=""
ENV FROM_EMAIL=""


# Install all base dependencies.
RUN apk add --no-cache --update openssl g++ make python3 musl-dev bash

# symlink python to python3
RUN ln -s /usr/bin/python3 /usr/bin/python && \
    ln -s /usr/bin/pip3 /usr/bin/pip


# Set the working directory to the root of the container
WORKDIR /home/app

# Bundle app source
COPY . /home/app

#
RUN npm config set unsafe-perm true

# This packages must be installed seperatly to prevent crash
# @since node 10.16
RUN npm install -g node-gyp
RUN npm install bcrypt --legacy-peer-deps

# Install all npm packages
RUN npm install --legacy-peer-deps

# ----------------------------------------------
RUN npm install knex -g
# ----------------------------------------------

RUN npm install -g nodemon


# Remove unused packages only used for building.
RUN rm -rf /var/cache/apk/*

# The place where the certificates should be:
# certificate.pem  certrequest.csr  privatekey.pem
RUN mkdir -p /home/app/certs && chown node:node /home/app/certs
RUN mkdir -p /home/app/certs4 && chown node:node /home/app/certs4
VOLUME ["/home/app/certs"]
VOLUME ["/home/app/certs4"]

# Owner rights for node user
RUN chown -R node:node /home/app
RUN chown -R node:node /home/app/certs

USER node

# Exposed ports for application
EXPOSE 4000/tcp
EXPOSE 4000/udp

# Run the application
CMD [ "npm", "start" ]
