## User activity

User must be able to view the data that is stored about them, and remove that data where appropiate.

The data is available under the following uri's:

```
GET :HOSTNAME/api/project/:PROJECT_ID/user/:USER_ID/activity
Authorization: Bearer :ACCESSTOKEN
```

This will reply with an overview of the users activity on this and other sites.

First a list of projects on which this users has logged in is added. Then a list of activities is created:

```
{
  "activity": [
    {
      "description": "",
      "type": {
        "slug": "'comment",
        "label": "reactie"
      },
      ...data of the activity
    }
  ]
}
```
Types are resources, comments and votes. All of these are added to the result too, so the complete response looks like this:

```
{
  "projects": [
     ...all projects where this user has logged in
  ],
  "resources": [
     ...all resources created by this user
  ],
  "comments": [
     ...all comments written by this user
  ],
  "votes": [
     ...all votes cast by this user
  ],
  "activity": [
     ...all of the resources, comments and votes sorted by create-date
  ]
}
```

### anonymize

The following request will remove a users data on one site:
```
PUT :HOSTNAME/api/project/:PROJECT_ID/user/8/do-anonymize
Authorization: Bearer :ACCESSTOKEN
```
To remove all userdata over all sites use
```
PUT :HOSTNAME/api/project/:PROJECT_ID/user/8/do-anonymize
Authorization: Bearer :ACCESSTOKEN
```
Test it with
```
PUT :HOSTNAME/api/project/:PROJECT_ID/user/8/will-anonymize
Authorization: Bearer :ACCESSTOKEN
```
which shows all impacted data but will make no changes.

Anonymizing consists of emptying all user data fields. The user itself will be not be removed, because it is needed voor umber of votes, origin of resources and comments, etc. 

Generic anonimize functions to remove all users from a project are also available, of course for admin users only. This is documented [here](todo).
