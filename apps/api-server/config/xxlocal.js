module.exports = {
  "url": "https://api.os20-headless-setup.nlsvgtr.nl",
  "hostname": "api.os20-headless-setup.nlsvgtr.nl",
  "database": {
    "host": "127.0.0.1",
    "user": "os20-headless-setup",
    "password": "X2OBLcph8n6R4PdC4x4GtIObHIwSCkvL",
    "database": "os20-headless-setup-api",
    "dialect": "mariadb",
    "multipleStatements": true
  },
  "express": {
    "port": "40010"
  },
  "mail": {
    "from": "niels@denes.nl",
    "transport": {
      "smtp": {
        "port": "465",
        "host": "smtp.example.xx",
        "auth": {
          "user": "USERNAME",
          "pass": "PASSWORD"
        }
      }
    }
  },
  "security": {
    "sessions": {
      "secret": "6Dp18qX4YmXS6grdTHiw3kBpcYG59Aht"
    }
  },
  "auth": {
    "adapter": {
      "openstad": {
        "serverUrl": "https://auth.os20-headless-setup.nlsvgtr.nl"
      }
    },
    "jwtSecret": "fo6TuHExvPJxzMD5qgnEj2AJUEf8czPJL1QydgWph3wZ42yPhFlAgb8wPDXM4yR2",
    "fixedAuthTokens": [
      {
        "token": "123",
        "userId": "1",
        "authProvider": "openstad"
      }
    ]
  },
  "dev": {
    "Header-Access-Control-Allow-Origin": "*"
  }
}
