# Notifications

The OpenStad system sends out a range of different notifications, mostly throught email.

The notification system works with types. These are defined by [hardcoded strings](#types).

When a new notification is created 








### Types

Currently available types:
- new or updated comment - admin update
- new concept resource - user feedback
- new published resource - user feedback
- new published resource - admin update
- updated resource - user feedback
- updated resource - admin update
- user account about to expire
- project issues warning
- system issues warning
- login email
- login sms
- submission
- action

## API notification endpoints:

#### Create a notification
```
POST :HOSTNAME/notification/project/:PROJECT_ID/notification
Content-Type: application/json
Authorization: XXX

{
  "type": "new published resource - user feedback",
  "data": {
    "resourceId": 1,
    "userId": 2
  }
}
```

See above; this is the only really usefull notification endpoint.

But for completeness the normal set of CRUD actions is available:

#### List all notifications
```
GET :HOSTNAME/notification/project/:PROJECT_ID/notification
Authorization: XXX
```

#### View one notifications
```
GET :HOSTNAME/notification/project/:PROJECT_ID/notification/:NOTIFICATION_ID
Authorization: XXX
```

#### Update a notification
```
PUT :HOSTNAME/notification/project/:PROJECT_ID/notification/:NOTIFICATION_ID
Content-Type: application/json
Authorization: XXX

{
  "label": "Email aan gebruiker bij een nieuw plan"
}

```

#### Delete a notification
```
DELETE :HOSTNAME/notification/project/:PROJECT_ID/notification/:NOTIFICATION_ID
Authorization: XXX
```




## API template endpoints:

#### List all templates
```
GET :HOSTNAME/notification/project/:PROJECT_ID/template
Authorization: XXX
```

#### View one templates
```
GET :HOSTNAME/notification/project/:PROJECT_ID/template/:TEMPLATE_ID
Authorization: XXX
```

#### Create a template
```
POST :HOSTNAME/notification/project/:PROJECT_ID/template
Content-Type: application/json
Authorization: XXX

{
  "engine": "email",
  "type": "new published resource - user feedback",
  "label": "My first template",
  "subject": "Bedankt voor je plan {{user.name}}",
  "body": "Dit is de tekst van de email, met als project waarde {{project.name}} en resource waarde {{resource.summary}}."
}
```

#### Update a template
```
PUT :HOSTNAME/notification/project/:PROJECT_ID/template/:TEMPLATE_ID
Content-Type: application/json
Authorization: XXX

{
  "label": "Email aan gebruiker bij een nieuw plan"
}

```

#### Delete a template
```
DELETE :HOSTNAME/notification/project/:PROJECT_ID/template/:TEMPLATE_ID
Authorization: XXX
```

## Todo:
- sms doet het nog niet
- default templates moeten nog gemaakt
- the dir for default templates could be configurable, to facilitate easy replacement
- types are hardcoded, which is fine for now, but a more abstracted use should move types to a databse
- this setup should make it simple to move to a seperate notification service
