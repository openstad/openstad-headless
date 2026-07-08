import ChangesDisplay from '@/components/audit-log-diff';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useAuditLog from '@/hooks/use-audit-log';
import React, { useState } from 'react';

type AuditLogTableProps = {
  modelName?: string;
  modelId?: string | number;
  userId?: string | number;
  projectId?: string | number;
};

const ACTION_LABELS: Record<string, { label: string; className: string }> = {
  POST: { label: 'Aangemaakt', className: 'bg-green-100 text-green-800' },
  PUT: { label: 'Bewerkt', className: 'bg-blue-100 text-blue-800' },
  DELETE: { label: 'Verwijderd', className: 'bg-red-100 text-red-800' },
  login: { label: 'Ingelogd', className: 'bg-purple-100 text-purple-800' },
  login_failed: {
    label: 'Login mislukt',
    className: 'bg-orange-100 text-orange-800',
  },
  logout: { label: 'Uitgelogd', className: 'bg-gray-100 text-gray-600' },
  register: {
    label: 'Geregistreerd',
    className: 'bg-green-100 text-green-700',
  },
  password_reset: {
    label: 'Wachtwoord reset',
    className: 'bg-yellow-100 text-yellow-800',
  },
  '2fa_configured': {
    label: '2FA geconfigureerd',
    className: 'bg-indigo-100 text-indigo-800',
  },
  '2fa_failed': {
    label: '2FA mislukt',
    className: 'bg-orange-100 text-orange-800',
  },
  cleanup: { label: 'Opgeschoond', className: 'bg-yellow-100 text-yellow-800' },
};

function ActionBadge({ action }: { action: string }) {
  const config = ACTION_LABELS[action] || {
    label: action,
    className: 'bg-gray-100 text-gray-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

const AUTH_METHOD_LABELS: Record<string, string> = {
  url: 'E-maillink',
  local: 'Wachtwoord',
  uniqueCode: 'Stemcode',
  anonymous: 'Anoniem',
  phonenumber: 'SMS',
};

function AuthEventDetails({ data }: { data: any }) {
  if (!data) return null;
  const method = data?.method;
  if (!method) return null;
  return (
    <Paragraph className="text-xs text-muted-foreground">
      Methode: {AUTH_METHOD_LABELS[method] || method}
    </Paragraph>
  );
}

const MODEL_LABELS: Record<string, string> = {
  widgets: 'Widget',
  resource: 'Inzending',
  tag: 'Tag',
  status: 'Status',
  area: 'Polygoon',
  user: 'Gebruiker',
  project: 'Project',
  submission: 'Formulier inzending',
  choicesguide: 'Keuzewijzer',
  datalayer: 'Kaartlaag',
  markers: 'Marker',
  pdf: 'PDF',
  AuthSession: 'Sessie',
  'audit-log': 'Logboek',
};

function formatModelName(
  modelName: string,
  modelId?: number | null,
  source?: string
) {
  const label = MODEL_LABELS[modelName] || modelName;
  if (!modelId || source === 'auth') return label;
  return `${label} ID ${modelId}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AuditLogTable({
  modelName,
  modelId,
  userId,
  projectId,
}: AuditLogTableProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAuditLog({
    modelName,
    modelId,
    userId,
    projectId,
    excludeAction: 'GET',
    page,
    pageSize: 20,
  });

  if (isLoading)
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Audit logs laden...</Paragraph>
      </div>
    );
  if (error)
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Fout bij het laden van audit logs.</Paragraph>
      </div>
    );

  const records = data?.records || [];
  const totalPages = data?.totalPages || 1;

  if (records.length === 0) {
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Geen audit logs gevonden.</Paragraph>
      </div>
    );
  }

  return (
    <div className="container px-0">
      <div className="p-6 bg-white rounded-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 items-center py-2 px-2 border-b border-border">
          <ListHeading className="hidden lg:flex lg:col-span-2">
            Datum/Tijd
          </ListHeading>
          <ListHeading className="hidden lg:flex lg:col-span-2">
            Gebruiker
          </ListHeading>
          <ListHeading className="hidden lg:flex lg:col-span-2">
            Actie
          </ListHeading>
          {!modelName && (
            <ListHeading className="hidden lg:flex lg:col-span-2">
              Object
            </ListHeading>
          )}
          <ListHeading
            className={`hidden lg:flex ${modelName ? 'lg:col-span-6' : 'lg:col-span-4'}`}>
            Wijzigingen
          </ListHeading>
        </div>
        <ul>
          {records.map((entry: any) => (
            <li
              key={entry.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 items-start py-3 px-2 border-b border-border hover:bg-muted/50">
              <Paragraph className="lg:col-span-2 text-xs">
                {formatDate(entry.createdAt)}
              </Paragraph>
              <div className="lg:col-span-2">
                <Paragraph className="text-xs font-medium">
                  {entry.userName || `User #${entry.userId || ''}`}
                </Paragraph>
                <Paragraph className="text-xs text-muted-foreground">
                  {entry.userRole || ''}
                </Paragraph>
              </div>
              <div className="lg:col-span-2">
                <ActionBadge action={entry.action} />
              </div>
              {!modelName && (
                <div className="lg:col-span-2">
                  <Paragraph className="text-xs">
                    {formatModelName(
                      entry.modelName,
                      entry.modelId,
                      entry.source
                    )}
                  </Paragraph>
                  {!projectId && entry.projectId && (
                    <Paragraph className="text-xs text-muted-foreground">
                      {entry.projectName
                        ? `${entry.projectName} ID ${entry.projectId}`
                        : `Project ID ${entry.projectId}`}
                    </Paragraph>
                  )}
                </div>
              )}
              <div className={modelName ? 'lg:col-span-6' : 'lg:col-span-4'}>
                {entry.source === 'auth' ? (
                  <AuthEventDetails data={entry.newData} />
                ) : (
                  <ChangesDisplay
                    previousData={entry.previousData}
                    newData={entry.newData}
                    action={entry.action}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <Paragraph className="text-xs text-muted-foreground">
              {data?.total || 0} resultaten, pagina {page} van {totalPages}
            </Paragraph>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">
                Vorige
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">
                Volgende
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
