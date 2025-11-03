{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "openstad.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "openstad.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "openstad.admin.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-admin-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.cdn.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-cdn-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.adminer.fullname" -}}
{{- printf "%s-%s" (include "openstad.fullname" .) .Values.adminer.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openstad.auth.fullname" -}}
{{- printf "%s-%s" (include "openstad.fullname" .) .Values.auth.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openstad.database.credentialsSecret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-db-credentials" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.auth.databaseSecret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-auth-db" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.auth.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-auth-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.cms.fullname" -}}
{{- printf "%s-%s" (include "openstad.fullname" .) .Values.cms.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openstad.cms.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-cms-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.s3.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-s3-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.passwordSecret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
mysql-secret
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.admin.fullname" -}}
{{- printf "%s-%s" (include "openstad.fullname" .) .Values.admin.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "openstad.api.fullname" -}}
{{- printf "%s-%s" (include "openstad.fullname" .) .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openstad.image.fullname" -}}
{{- printf "%s-%s" (include "openstad.fullname" .) .Values.image.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "openstad.image.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-image-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.clusterIssuer.staging.fullname" -}}
    {{ .Values.clusterIssuer.stagingIssuerName }}
{{- end -}}

{{- define "openstad.clusterIssuer.prod.fullname" -}}
    {{ .Values.clusterIssuer.prodIssuerName }}
{{- end -}}

{{- define "openstad.clusterIssuer.name" -}}
{{- if .Values.clusterIssuer.useProdIssuer -}}
    {{ template "openstad.clusterIssuer.prod.fullname" . }}
{{- else -}}
    {{ template "openstad.clusterIssuer.staging.fullname" . }}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "openstad.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "openstad.labels" -}}
helm.sh/chart: {{ include "openstad.chart" . }}
{{ include "openstad.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "openstad.selectorLabels" -}}
app.kubernetes.io/name: {{ include "openstad.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
    URL Creation
*/}}

{{- define "openstad.api.url" -}}
{{- if .Values.api.subdomain -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.api.subdomain }}.{{ .Values.host.base }}
{{- else -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.host.base }}
{{- end -}}
{{- end -}}


{{- define "openstad.auth.url" -}}
{{- if .Values.auth.subdomain -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.auth.subdomain }}.{{ .Values.host.base }}
{{- else -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.host.base }}
{{- end -}}
{{- end -}}

{{- define "openstad.admin.url" -}}
{{- if .Values.admin.customDomain -}}
{{ .Values.admin.customDomain }}
{{- else -}}
{{- if .Values.admin.subdomain -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.admin.subdomain }}.{{ .Values.host.base }}
{{- else -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.host.base }}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "openstad.cms.url" -}}
{{- if .Values.cms.subdomain -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.cms.subdomain }}.{{ .Values.host.base }}
{{- else -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.host.base }}
{{- end -}}
{{- end -}}

{{- define "openstad.cms.urlwithWww" -}}
www.{{ .Values.host.base }}
{{- end -}}

{{- define "openstad.cms.urlwithoutWww" -}}
{{ .Values.host.base }}
{{- end -}}


{{- define "openstad.image.url" -}}
{{- if .Values.image.subdomain -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.image.subdomain }}.{{ .Values.host.base }}
{{- else -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.host.base }}
{{- end -}}
{{- end -}}

{{- define "openstad.adminer.url" -}}
{{- if .Values.adminer.subdomain -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.adminer.subdomain }}.{{ .Values.host.base }}
{{- else -}}
{{- if .Values.host.usewww -}}www.{{- end -}}{{ .Values.host.base }}
{{- end -}}
{{- end -}}

{{/*
    Fixed Secrets
*/}}
{{- define "openstad.session.fixedSecret" -}}
    {{ randAlphaNum 12 }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "openstad.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "openstad.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{- define "openstad.email.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-email-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.api.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-api-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.ratelimit.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-ratelimit-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.session.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-session-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}

{{- define "openstad.ipaddress.secret.fullname" -}}
{{- if not .Values.secrets.existingSecret -}}
{{- printf "%s-ipaddress-secret" (include "openstad.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{ .Values.secrets.existingSecret }}
{{- end -}}
{{- end -}}