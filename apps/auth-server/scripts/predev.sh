#!/bin/bash
if [ ! -f "./init/done" ]; then
    cd certs
    openssl genrsa -out privatekey.pem 2048
    openssl req -new -key privatekey.pem -out certrequest.csr -subj '/C=NL/ST=NA/L=NA/O=OpenStad/OU=OpenStad/CN=openstad.${AUTH_DOMAIN}'
    openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
    cd ..
    npm run init-database && touch ./init/done;
fi