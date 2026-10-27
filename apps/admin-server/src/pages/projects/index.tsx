import { SessionContext } from '@/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import { sortTable } from '@/components/ui/sortTable';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useTemplates from '@/hooks/use-template';
import { HasAccess } from '@/lib/hasAccess';
import { Check, ChevronRight, LayoutTemplate, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import React from 'react';
import toast from 'react-hot-toast';

import projectListSwr from '../../hooks/use-project-list';

type SearchableField = {
  key: string;
  label: string;
  getValue: (project: any) => string;
};

const SEARCHABLE_FIELDS: SearchableField[] = [
  { key: 'name', label: 'Projectnaam', getValue: (p) => p?.name || '' },
  { key: 'url', label: 'URL', getValue: (p) => p?.url || '' },
  {
    key: 'votes',
    label: 'Stemmen',
    getValue: (p) => (p?.config?.votes?.isActive === true ? 'Aan' : 'Uit'),
  },
  {
    key: 'comments',
    label: 'Reacties',
    getValue: (p) => (p?.config?.comments?.canComment === true ? 'Aan' : 'Uit'),
  },
  {
    key: 'endDate',
    label: 'Eind datum',
    getValue: (p) => {
      const date = p?.config?.project?.endDate;
      return date ? new Date(date).toLocaleDateString('nl-NL') : '';
    },
  },
];

const fieldsByKey = Object.fromEntries(
  SEARCHABLE_FIELDS.map((f) => [f.key, f])
);

const applyStatusFilter = (
  projects: any[],
  status: 'all' | 'ended' | 'active'
) => {
  if (!projects) return projects;
  if (status === 'all') return projects;
  if (status === 'ended')
    return projects.filter(
      (p: any) => p?.config?.project?.projectHasEnded === true
    );
  return projects.filter(
    (p: any) => p?.config?.project?.projectHasEnded !== true
  );
};

const applySearchFilter = (projects: any[], term: string, fieldKey: string) => {
  if (!projects || term.length < 1) return projects;
  const lowerTerm = term.toLowerCase();
  return projects.filter((item: any) => {
    if (fieldKey) {
      return (
        fieldsByKey[fieldKey]
          ?.getValue(item)
          .toLowerCase()
          .includes(lowerTerm) ?? false
      );
    }
    return SEARCHABLE_FIELDS.some((field) =>
      field.getValue(item).toLowerCase().includes(lowerTerm)
    );
  });
};

export default function Projects() {
  const { data } = projectListSwr();
  const router = useRouter();

  const [filterSearchType, setFilterSearchType] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ended' | 'active'>(
    'active'
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let result = applyStatusFilter(data, statusFilter);
    return applySearchFilter(result, searchTerm, filterSearchType);
  }, [data, statusFilter, searchTerm, filterSearchType]);

  // Separate state for column sorting (sortTable mutates imperatively)
  const [sortedData, setSortedData] = useState<any[] | null>(null);
  useEffect(() => setSortedData(null), [filteredData]);

  const displayData = sortedData ?? filteredData;

  const sessionData = useContext(SessionContext);
  const { createTemplateFromProject } = useTemplates();

  const [templateSource, setTemplateSource] = useState<any>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);

  async function saveAsTemplate() {
    if (!templateSource || !templateName.trim()) return;
    setTemplateSaving(true);
    try {
      await createTemplateFromProject(templateName.trim(), templateSource.id);
      toast.success('Template opgeslagen.');
      setTemplateSource(null);
    } catch (error) {
      toast.error('Opslaan als template is niet gelukt.');
    } finally {
      setTemplateSaving(false);
    }
  }

  if (!data)
    return (
      <div>
        <PageLayout
          pageHeader="Projecten"
          breadcrumbs={[
            {
              name: 'Projecten',
              url: '/projects',
            },
          ]}
          action={
            HasAccess(sessionData) && (
              <Link href="/projects/create">
                <Button variant="default" className="flex w-fit">
                  <Plus size="20" className="hidden lg:flex" />
                  Project toevoegen
                </Button>
              </Link>
            )
          }></PageLayout>
      </div>
    );

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
        ]}
        action={
          HasAccess(sessionData) && (
            <Link href="/projects/create">
              <Button variant="default" className="flex w-fit">
                <Plus size="20" className="hidden lg:flex" />
                Project toevoegen
              </Button>
            </Link>
          )
        }>
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4 px-6 py-5 bg-white rounded-md border border-border">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex gap-1.5">
                {(
                  [
                    { value: 'all', label: 'Alle projecten' },
                    { value: 'active', label: 'Actief' },
                    { value: 'ended', label: 'Beëindigd' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      statusFilter === option.value
                        ? 'border-border bg-gray-100 font-medium text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground hover:bg-gray-50'
                    }`}
                    onClick={() => setStatusFilter(option.value)}>
                    {statusFilter === option.value && (
                      <Check size={14} strokeWidth={2.5} />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="px-4 py-2.5 text-sm rounded-md border border-border bg-white w-56"
                placeholder="Zoeken..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-4 py-2.5 text-sm rounded-md border border-border bg-white w-36"
                onChange={(e) => setFilterSearchType(e.target.value)}>
                <option value="">Zoek alles</option>
                {SEARCHABLE_FIELDS.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-2 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('name', e, displayData))
                  }>
                  Projectnaam
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('issues', e, displayData))
                  }>
                  Problemen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('votesIsActive', e, displayData))
                  }>
                  Stemmen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('commentsIsActive', e, displayData))
                  }>
                  Reacties
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('resources', e, displayData))
                  }>
                  Inzendingen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('endDate', e, displayData))
                  }>
                  Einddatum
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setSortedData(sortTable('url', e, displayData))
                  }>
                  url
                </button>
              </ListHeading>
            </div>
            <ul>
              {displayData?.map((project: any) => (
                <li
                  className="grid grid-cols-2 lg:grid-cols-8 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2"
                  key={project.id}
                  onClick={() =>
                    router.push(`${router.asPath}/${project.id}/widgets`)
                  }>
                  <Paragraph className="truncate">
                    {fieldsByKey.name.getValue(project)}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate">
                    Geen
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate">
                    {fieldsByKey.votes.getValue(project)}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate">
                    {fieldsByKey.comments.getValue(project)}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate">
                    Open
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate -mr-16">
                    {fieldsByKey.endDate.getValue(project)}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate">
                    {fieldsByKey.url.getValue(project)}
                  </Paragraph>
                  <Paragraph className="flex items-center justify-end gap-2">
                    {HasAccess(sessionData) && (
                      <button
                        type="button"
                        title="Bewaar als template"
                        aria-label={`Bewaar project ${
                          project.name || ''
                        } als template`}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateName(project.name || '');
                          setTemplateSource(project);
                        }}>
                        <LayoutTemplate strokeWidth={1.5} className="w-5 h-5" />
                      </button>
                    )}
                    <ChevronRight
                      strokeWidth={1.5}
                      className="w-5 h-5 my-auto"
                    />
                  </Paragraph>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Dialog
          open={!!templateSource}
          onOpenChange={(open) => {
            if (!open) setTemplateSource(null);
          }}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Bewaar als template</DialogTitle>
            </DialogHeader>
            <p>
              Er wordt een losstaande kopie van dit project opgeslagen als
              template. Latere wijzigingen aan het project of de template
              beïnvloeden elkaar niet.
            </p>
            <div className="space-y-2">
              <label htmlFor="template-name" className="text-sm font-medium">
                Templatenaam
              </label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Naam"
              />
            </div>
            <Button
              onClick={() => saveAsTemplate()}
              disabled={templateSaving || !templateName.trim()}>
              {templateSaving ? 'Bezig met opslaan' : 'Opslaan'}
            </Button>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </div>
  );
}
