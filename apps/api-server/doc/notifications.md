# Notifications

The OpenStad system sends out a range of different notifications, mostly through email.

The notification system works with TypeScript based types. These are defined by [hardcoded strings](#types).
Notifications can have `subject`, `body`, and `from` and `to` fields set.

It also has a `data` field, which contains data that is used in the creation of a notification message. If this field contains a 'resourceId' key, then the resource with that ID is used during message creation. Any field from the corresponding resource can be used in the message. The same goes for project, user and submission.

When a new notification is created, it automatically creates a NotificationMessage, which will then be sent toward the receiver defined in the `to` field.

The method of sending a notification is defined in the `engine` field. At the moment, this can either be `email` of `sms`.

Each type of message can have a corresponding template defined. If no template is defined, then the default template for this type will be used. These default templates can be found in the directory `src/notifications/default-templates`.

Templates combine mjml and nunjucks, and the aforementioned `data` field. Below is an example of how this is set up.

```
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text>
          Beste {{user.name}},<br/>
          <br/>
          Bedankt voor je plan "{{resource.title}}".
          <br/>
          Groeten van het OpenStad team
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

Note: some types (currently 'new or updated comment - admin update') are saved with status queued; the above message creating and sending is then done from a cron job.

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

See above; this is the only truly useful notification endpoint.

But for completeness the normal set of CRUD actions is available:

#### List all notifications
```
GET :HOSTNAME/notification/project/:PROJECT_ID/notification
Authorization: XXX
```

#### View a single notification
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

#### View a single template
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
- types are hardcoded, which is fine for now, but a more abstracted use should move types to a data store
- this setup should make it simple to move to a seperate notification service
