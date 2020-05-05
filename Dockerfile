FROM alpine:3.9

# Set the working directory to the root of the container
WORKDIR /srv/openstad/


# Copy all content to the Docker image.
COPY . .

# ----------------------------------
# Install all base dependencies.
# ----------------------------------
RUN apk add --no-cache --update openssl g++ make python musl-dev nodejs npm

# ----------------------------------
# Generate certificates
# ----------------------------------
RUN openssl genrsa   -out privatekey.pem 2048
RUN openssl req -new -key privatekey.pem -out certrequest.csr -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"
RUN openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
RUN mkdir -p certs
RUN mv certificate.pem /srv/openstad/certs/
RUN mv certrequest.csr /srv/openstad/certs/
RUN mv privatekey.pem /srv/openstad/certs/

# ----------------------------------
# Build and install all npm packages
# ----------------------------------
RUN npm install
#RUN npm install knex -g
#RUN knex migrate:latest



# -------------------------------------------------
# Remove unused packages only used for building.
# -------------------------------------------------
RUN apk del make python g++ && rm -rf /var/cache/apk/*

# -------------------------------------------------
# Execute the application.
# -------------------------------------------------
CMD [ "npm", "start" ]
