import { Button } from '@/components/ui/button';
import { Paragraph } from '@/components/ui/typography';
import { useWidgetVersions } from '@/hooks/use-widget-versions';
import Link from 'next/link';
import React from 'react';

type WidgetVersionHistoryProps = {
  widgetId?: string | number;
  projectId?: string | number;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WidgetVersionHistory({
  widgetId,
  projectId,
}: WidgetVersionHistoryProps) {
  const { data, error, isLoading } = useWidgetVersions(widgetId, projectId);

  const historyUrl = `/projects/${projectId}/widgets/version-history/${widgetId}`;

  if (isLoading)
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Versiegeschiedenis laden...</Paragraph>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-white rounded-md">
        <Paragraph>Fout bij het laden van de versiegeschiedenis.</Paragraph>
      </div>
    );

  const versions = data || [];
  const latest = versions[0];

  return (
    <div className="p-6 bg-white rounded-md">
      {versions.length === 0 ? (
        <Paragraph className="mb-4">
          Er zijn nog geen versies opgeslagen. Elke keer dat je de configuratie
          opslaat, wordt er automatisch een versie bewaard.
        </Paragraph>
      ) : (
        <div className="mb-4">
          <Paragraph className="font-medium">
            {versions.length} opgeslagen versie
            {versions.length === 1 ? '' : 's'}
          </Paragraph>
          {latest && (
            <Paragraph className="text-sm text-muted-foreground">
              Laatst opgeslagen op {formatDate(latest.createdAt)} door{' '}
              {latest.userName || `Gebruiker #${latest.userId || ''}`}
            </Paragraph>
          )}
        </div>
      )}
      <Link href={historyUrl}>
        <Button type="button" variant="default">
          Open volledige versiegeschiedenis
        </Button>
      </Link>
    </div>
  );
}
