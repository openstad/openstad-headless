FROM alpine:3.9

# Set the working directory to the root of the container
WORKDIR /srv/openstad/

# Set the current user of the image to 'root'.
USER root

# Copy all content to the Docker image.
COPY . .

# ----------------------------------
# Install all base dependencies.
# ----------------------------------
RUN apk add --no-cache --update g++ make python musl-dev nodejs npm openssl

# ----------------------------------
# Build and install all npm packages
# ----------------------------------
RUN npm install
RUN npm install knex -g

# ----------------------------------
# Generate certificates
# ----------------------------------
RUN openssl genrsa -out privatekey.pem 2048
RUN openssl req -new -key privatekey.pem -out certrequest.csr
RUN openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
RUN mkdir certs
RUN mv certificate.pem cert
RUN mv certrequest.csr cert
RUN mv privatekey.pem cert

# -------------------------------------------------
# Remove unused packages only used for building.
# -------------------------------------------------
RUN apk del make python g++ && rm -rf /var/cache/apk/*

# -------------------------------------------------
# Execute the application.
# -------------------------------------------------
CMD [ "npm", "start" ]
