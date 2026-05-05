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
  GET: { label: 'Bekeken', className: 'bg-gray-100 text-gray-800' },
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
  cleanup: {
    label: 'Opgeschoond',
    className: 'bg-yellow-100 text-yellow-800',
  },
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

function ChangesDisplay({
  previousData,
  newData,
  action,
}: {
  previousData: Record<string, any> | null;
  newData: Record<string, any> | null;
  action: string;
}) {
  if (action === 'GET' || action === 'login' || action === 'logout') {
    if (newData && Object.keys(newData).length > 0) {
      return (
        <div className="text-xs text-muted-foreground">
          {Object.entries(newData).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  if (action === 'DELETE' && previousData) {
    return (
      <div className="text-xs text-muted-foreground">
        {Object.entries(previousData)
          .slice(0, 5)
          .map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key}:</span>{' '}
              <span className="text-red-600 line-through">
                {String(value)?.substring(0, 100)}
              </span>
            </div>
          ))}
        {Object.keys(previousData).length > 5 && (
          <div className="text-muted-foreground">
            +{Object.keys(previousData).length - 5} meer...
          </div>
        )}
      </div>
    );
  }

  if (!previousData && !newData) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  const data = newData || {};
  const prev = previousData || {};

  return (
    <div className="text-xs text-muted-foreground">
      {Object.entries(data)
        .slice(0, 5)
        .map(([key, value]) => (
          <div key={key}>
            <span className="font-medium">{key}:</span>{' '}
            {prev[key] !== undefined && (
              <>
                <span className="text-red-600 line-through">
                  {String(prev[key])?.substring(0, 50)}
                </span>
                {' → '}
              </>
            )}
            <span className="text-green-700">
              {String(value)?.substring(0, 100)}
            </span>
          </div>
        ))}
      {Object.keys(data).length > 5 && (
        <div className="text-muted-foreground">
          +{Object.keys(data).length - 5} meer...
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('nl-NL', {
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
  const pageSize = 20;

  const { data, isLoading, error } = useAuditLog({
    modelName,
    modelId,
    userId,
    projectId,
    page,
    pageSize,
  });

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Audit logs laden...</Paragraph>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Fout bij het laden van audit logs.</Paragraph>
      </div>
    );
  }

  const records = data?.records || [];
  const total = data?.total || 0;
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
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center py-2 px-2 border-b border-border">
          <ListHeading className="hidden lg:flex lg:col-span-2">
            Datum/Tijd
          </ListHeading>
          <ListHeading className="hidden lg:flex lg:col-span-2">
            Gebruiker
          </ListHeading>
          <ListHeading className="hidden lg:flex lg:col-span-1">
            Actie
          </ListHeading>
          {!modelName && (
            <ListHeading className="hidden lg:flex lg:col-span-1">
              Object
            </ListHeading>
          )}
          <ListHeading
            className={`hidden lg:flex ${modelName ? 'lg:col-span-5' : 'lg:col-span-4'}`}>
            Wijzigingen
          </ListHeading>
          <ListHeading className="hidden lg:flex lg:col-span-2">
            IP-adres
          </ListHeading>
        </div>
        <ul>
          {records.map((entry: any) => (
            <li
              key={entry.id}
              className="grid grid-cols-1 lg:grid-cols-12 items-start py-3 px-2 border-b border-border hover:bg-muted/50">
              <Paragraph className="lg:col-span-2 text-xs">
                {formatDate(entry.createdAt)}
              </Paragraph>
              <div className="lg:col-span-2">
                <Paragraph className="text-xs font-medium">
                  {entry.userName || `User #${entry.userId || '-'}`}
                </Paragraph>
                <Paragraph className="text-xs text-muted-foreground">
                  {entry.userRole || '-'}
                </Paragraph>
              </div>
              <div className="lg:col-span-1">
                <ActionBadge action={entry.action} />
                {entry.source === 'auth' && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (auth)
                  </span>
                )}
              </div>
              {!modelName && (
                <Paragraph className="lg:col-span-1 text-xs">
                  {entry.modelName}
                  {entry.modelId ? ` #${entry.modelId}` : ''}
                </Paragraph>
              )}
              <div className={modelName ? 'lg:col-span-5' : 'lg:col-span-4'}>
                <ChangesDisplay
                  previousData={entry.previousData}
                  newData={entry.newData}
                  action={entry.action}
                />
              </div>
              <Paragraph className="lg:col-span-2 text-xs text-muted-foreground">
                {entry.ipAddress || '-'}
              </Paragraph>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <Paragraph className="text-xs text-muted-foreground">
              {total} resultaten, pagina {page} van {totalPages}
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
