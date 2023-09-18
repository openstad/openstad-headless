(async function() {

  let response = await fetch('https://auth.os20-headless-setup.nlsvgtr.nl/oauth/token', {
    headers: { 'Content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({
      client_id: 'uniquecode',
      client_secret: 'uniquecode123',
      code: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5OTJmNTJkZi1iNmVjLTQ1YmItOTZkMy03OWFmZTFmODlhNWEiLCJzdWIiOjMsImV4cCI6MTY5NDc3MDU4NCwiaWF0IjoxNjk0NzcwMjg0fQ.W_xHK-X7BKhiJDJ29s4jmXdylcw1aGNIJd8mOjCcpk0cRmfcfUVYPs93LzzOO2I_E7SVGWLBrQrj3ieXC33SSSp8OxVs9QT1MQzxKdx5QK4n8C3GoNyZ7rdDo1h8BKyocCDoZEDrNjv2aywj4DuBRx5v2dva5VHGAFDMSMy1dwR7oXWUJ9cURLh8gQdn0XGqXx5RDe6BNihX5ZQfIx5jUmIlZVNrq96wqEX_3exKqMi49alCpWlcKJi-MfyUhPJ50-Z4e72hPp75TUhdsxZuE2hgwG6QhVoizsPVP3wkfQec6L0gwWhu62GPQ38hzzafGoo6HyQr3I6jTD_YxKeBYw',
      grant_type: 'authorization_code'
    })
  })
  console.log('==2');
}
)()
