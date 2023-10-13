## Authentication and authorization

The OpenStad API does not have an authentication and authorization mechanism. It is dependant on an external service for that.
The OpenStad suite does come with an auth-server. The default setup of the API uses that server.

But it should be possible to use other services, and therefore the API has a range of possibillities to replace the existing auth service.

### API users

The API keeps track of users. These users are created and updated in the login proces, or through specific API calls. See the 'routes' docs for the latter.

An API user is usually connected to a specific site, and is authorized only on that site. Authorization is [role based](#roles).

The result of the login process should ba a JWT. Any subsequent call should contain that JWT in a header: `Authorization: Bearer JWT`.

A call to the `/auth/site/ID/me` endpoint will return the API user defined in the JWT.

#### Roles

Authorization on the API is done through roles. Each API user has one role. The API recognizes 5 roles: admin, editor, moderator, member and anonymous.

### Adapters and providers

Adapters are software to connect to and handle the results of an external auth server.  
Providers are specificly configured uses of adapters.

For example: the `OpenStad` adapter creates routes to login and logout on the OpenStad auth server. It will redirect to the auth server, and upon return will create or update an API user. It will then provide an access token with which to access the API.
The standard configuration of the API defines two providers: `default` and `anonymous`. Both use the `OpenStad` adapter, but with different configs.

The API comes with two adapters: `OpenStad` and `OIDC`. A `SAML` adapter should be available as well, but is not yet.

The provider used is determined first by the query param `useAuth`. If that is not defined the value of config.auth.default is used. If that is not defined the value `default` will be used.

#### Configuring providers

Configuration is done in the `auth` block in environment vars and/or `Project.config`.

The minimal configuration in defines the url of the auth server and a jwt secret.
```
AUTH_JWTSECRET=
AUTH_ADAPTER_OPENSTAD_SERVERURL=
```
or 
```
"auth": {
  "adapter": {
    "openstad": {
      "serverUrl": "https://auth.os20.example"
    }
  },
  "jwtSecret": "The secret used to sign JSON web tokens"
}
```

Per site a minimal configuration of `default` and `anonymous` provider should contain clientId and clientSecret on the OpenStad auth sever:
```
"auth": {
  "provider": {
    "default": {
      "clientId": "emaillink",
      "clientSecret": "emaillink12345"
    },
    "anonymous": {
      "clientId": "anonymous",
      "clientSecret": "anonymous12345"
    }
  }
}
```

The only other generic configuration is the [User mapping](#user-mapping) which is explained later.

Further configuration of providers and adapters is dependent on the adapter used. The `oidc` adapter for example is a rather basic implementation of OpenID Connect and has these options:
```
"auth": {
  "adapter": {
    "oidc": {
      "serverUrl": "SERVERURL",
      "clientId": "CLIENTID",
      "clientSecret": "CLIENTSECRET",
      "serverLoginPath": "SERVERLOGINPATH",
      "serverLogoutPath": "SERVERLOGOUTPATH",
      "serverExchangeCodePath": "SERVEREXCHANGECODEPATH",
      "serverUserInfoPath": "SERVERUSERINFOPATH"
    }
  }
}
```

### User mapping

User mapping is part of a provider or adapter configuration and defines the translation of external userData to an API user. Information about the external user is stored in the idpUser field:

```
idpUser: {
  identifier:
  accesstoken:
}
```
The identifier field should always be mapped.

NOTE: is dit wel zo? Ik denk dat dit ook adapter specifiek is. Je kunt dan volhouden dat idpUser een vrij veld zou moeten zijn en niet gedefinieerd in de generiek map-user.

The mapping should be a string, because it should be storable as JSON. In this example the code has not yet been stringified for readability:
```
"auth": {
  "provider": {
    "default": {
      "userMapping": JSON.stringify({
        identifier: "user => user.id",
        name: "user => `${user.firstName || ''} ${user.lastName || ''}`.trim() || null",
        email: "user => user.email == '' ? null : user.email",
        role: null,
      })
    }
  }
}
```

### SSO

The `oidc` adapter has one extra endpoint:
```
POST /auth/site/:siteId/connect-user?useAuth=my-sso-server
Content-type: application/json

{
  "access_token": "AN ACCESS TOKEN",
  "iss": "MUST BE EQUAL TO DEFINED serverURL"
}
```
Through this enpoint external users can be added to the API: a call is made to the defined server and the userData fetched. If the user does not yet exist in the API it is created. The result is a jwt that can be used for subsequent calls to the API.

This makes it possible for a user of your CMS to be recognized by the OpenStad API, and use all the OpenStad component functionality.

NOTE: hier mag nog wel een voorbeeld bij denk ik...

### Writing adapters

Sorry, no documentation (yet). Look at the existing adapters in API/src/adapters.
To refer to your new adapter use the adapter configuration:
```
"auth": {
  "adapter": {
    "mycooladapter": {
      "modulePath": "../mycooladapter"
    }
  },
  "provider": {
    "default": {
      "adapter": "mycooladapter"
    }
  }
}
```

#### Syncing to auth servers

When creating, deleting or updating users on the API these changes should probably be sent to the login provider as well. This can be done in the adapter.

You can use the openstad adapter as an example. Code will be synced if the adapter.serveice has a defined function for that synhronization. Currently the recognized functions are:
 - __service.createUser__
 - __service.updateUser__
 - __service.deleteUser__
 - __service.updateClient__ - for configuration options that are used during login

### ToDo
- A SAML adapter
- The JWT is created in the adapter, but used in generic API middleware. That means it has to be created in a specific way, and should therefore be available as an API service to the adapter.
