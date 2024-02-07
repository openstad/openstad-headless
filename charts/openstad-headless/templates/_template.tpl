---

# Secrets
{{- define "databaseSecret" -}}
  type: {{ .Values.secrets.database.type | default "mysql" | b64enc }}
  database: {{ .Values.secrets.database.dbName | default "mysql" | b64enc }}
  hostname: {{ .Values.secrets.database.hostname | default (printf "%s-mysql.%s.svc.cluster.local" .Release.Name .Release.Namespace) | b64enc }}
  hostport: {{ .Values.secrets.database.hostport | default 3306 | toString | b64enc }}
  password: {{ .Values.mysql.db.password | default ( randAlphaNum 12 | quote ) | b64enc }}
  username: {{ .Values.secrets.database.username | default "openstad" | b64enc }}
  ca-cert: {{ .Values.secrets.database.caCert | default "" | b64enc }}
{{- end }}

{{- define "sessionSecret" -}}
  secret: {{ ( randAlphaNum 12 | quote ) | b64enc }}
{{- end }}

{{- define "cookieSecret" -}}
  cookie_name: {{ .Values.secrets.cookies.cookieName | default "openstad.sid" | b64enc }}
  only_secure: {{ .Values.secrets.cookies.onlySecure | default "true" | b64enc }}
  jwt_secret: {{ .Values.secrets.cookies.jwtSecret | default ( randAlphaNum 12 | quote ) | b64enc }}
{{- end }}

{{- define "imageDbSecret" -}}
  database: {{ .Values.secrets.database.image.dbName | default "image" | b64enc }}
{{- end }}

{{- define "mysqlSecret" -}}
  mysql-root-password: {{ .Values.secrets.database.rootPassword | default ( randAlphaNum 12 | quote ) | b64enc }}
  mysql-replication-password: {{ .Values.secrets.database.replicationPassword | default ( randAlphaNum 12 | quote ) | b64enc }}
  mysql-password: {{ .Values.mysql.db.password | default ( randAlphaNum 12 | quote ) | b64enc }}
{{- end }}

{{- define "apiDbSecret" -}}
  database: {{ .Values.secrets.database.api.dbName | default "api" | b64enc }}
{{- end }}

{{- define "authDbSecret" -}}
  database: {{ .Values.secrets.database.auth.dbName | default "auth" | b64enc }}
{{- end }}

{{- define "hostsSecret" -}}
  api: {{ .Values.secrets.hosts.api | default (printf "%s.%s.svc.cluster.local" .Values.api.service.name .Release.Namespace) | b64enc }}
  auth: {{ .Values.secrets.hosts.auth | default (printf "%s.%s.svc.cluster.local" .Values.auth.service.name .Release.Namespace) | b64enc }}
  frontend: {{ .Values.secrets.hosts.frontend | default (printf "%s.%s.svc.cluster.local" .Values.frontend.service.name .Release.Namespace) | b64enc }}
  image: {{ .Values.secrets.hosts.image | default (printf "%s.%s.svc.cluster.local" .Values.image.service.name .Release.Namespace) | b64enc }}
{{- end }}

{{- define "S3Secret" -}}
  endpoint: {{ .Values.S3.endpoint | default "ams3.digitaloceanspaces.com" | b64enc }}
  key: {{ .Values.S3.key | default "xxxxx" | b64enc }}
  secret:  {{ .Values.S3.secret | default "yyyyy" | b64enc }}
  bucket:  {{ .Values.S3.bucket | default "openstad" | b64enc }}
{{- end }}

{{- define "FrontendS3Secret" -}}
  endpoint: {{ .Values.frontend.S3.endpoint | default "" | b64enc }}
  key: {{ .Values.frontend.S3.key | default "" | b64enc }}
  secret: {{ .Values.frontend.S3.secret | default "" | b64enc }}
  bucket: {{ .Values.frontend.S3.bucket | default "" | b64enc }}
  region: {{ .Values.frontend.S3.region | default "" | b64enc }}
{{- end }}

{{- define "authCredSecret" -}}
  client_id: {{ .Values.secrets.database.auth.credentials.clientId | default "clientID" | b64enc }}
  client_secret: {{ .Values.secrets.database.auth.credentials.clientSecret | default ( randAlphaNum 12 | quote ) | b64enc }}
  first_login_token: {{ .Values.secrets.database.auth.credentials.firstLoginToken | default "OPENSTAD_ADMIN" | b64enc }}
  fixed_user_id: {{ .Values.secrets.database.auth.credentials.fixedUserId | default 2 | toString | b64enc }}
  fixed_token: {{ .Values.secrets.database.auth.credentials.fixedToken | default ( randAlphaNum 12 | quote ) | b64enc }}
  admin_client_id: {{ .Values.secrets.database.auth.credentials.adminClientId | default "adminClientID" | b64enc }}
  admin_client_secret: {{ .Values.secrets.database.auth.credentials.adminClientSecret | default ( randAlphaNum 12 | quote ) | b64enc }}
{{- end }}

{{- define "apiMailSecret" -}}
  host: {{ .Values.secrets.mail.api.host | default "mail.example.com" | b64enc }}
  port: {{ .Values.secrets.mail.api.port | default 587 | toString | b64enc }}
  user: {{ .Values.secrets.mail.api.user | default "user@example.com" | b64enc }}
  email_from: {{ .Values.secrets.mail.api.emailFrom | default "user@example.com" | b64enc }}
  admin_email_from: {{ .Values.secrets.mail.api.adminEmailFrom | default "admin-user@example.com" | b64enc }}
  password: {{ .Values.secrets.mail.api.password | default ( randAlphaNum 12 | quote ) | b64enc }}
  require_ssl: {{ .Values.secrets.mail.api.requireSsl | default "true" | b64enc }}
{{- end}}

{{- define "authMailSecret" -}}
  host: {{ .Values.secrets.mail.auth.host | default "mail.example.com" | b64enc }}
  email_assets_url: {{ .Values.secrets.mail.auth.emailAssetsUrl | default "assets.example.com" | b64enc }}
  port: {{ .Values.secrets.mail.auth.port | default 587 | toString | b64enc }}
  user: {{ .Values.secrets.mail.auth.user | default "mail@example.com" | b64enc }}
  password: {{ .Values.secrets.mail.auth.password | default ( randAlphaNum 12 | quote ) | b64enc }}
{{- end}}
