const { exec } = require('child_process');
exec('openssl genrsa -out ./certs/privatekey.pem 2048 &&   openssl req -new -key ./certs/privatekey.pem -out ./certs/certrequest.csr -subj "/C=NL/ST=All/L=Amsterdam/O=openstad/CN=www.openstad.org" &&     openssl x509 -req -in ./certs/certrequest.csr -signkey ./certs/privatekey.pem -days 3650 -out ./certs/certificate.pem;', (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err)
  } else {
   // the *entire* stdout and stderr (buffered)
   console.log(`stdout: ${stdout}`);
   console.log(`stderr: ${stderr}`);
  }
});
