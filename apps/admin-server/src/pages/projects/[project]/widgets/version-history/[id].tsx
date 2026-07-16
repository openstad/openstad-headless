import ChangesDisplay from '@/components/audit-log-diff';
import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Paragraph } from '@/components/ui/typography';
import WidgetPreview from '@/components/widget-preview';
import { useWidgetDefinitions } from '@/hooks/use-widget-definitions';
import { WidgetVersion, useWidgetVersions } from '@/hooks/use-widget-versions';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export const getServerSideProps = withApiUrl;

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

function versionLabel(version: WidgetVersion) {
  return version.name || formatDate(version.createdAt);
}

const ALWAYS_STRIP = new Set(['widgetId', 'projectId', 'uuid']);

function stripSystemFields(value: any, isTop = false): any {
  if (Array.isArray(value)) return value.map((v) => stripSystemFields(v));
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      if (ALWAYS_STRIP.has(key)) continue;
      if (isTop && key === 'id') continue;
      out[key] = stripSystemFields(val);
    }
    return out;
  }
  return value;
}

type DetailView = 'preview' | 'diff';

export default function WidgetVersionHistoryPage({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const projectId = router.query.project as string;
  const id = router.query.id as string;

  const { data: widget } = useSWR(
    projectId && id
      ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
      : null
  );
  const widgetDefinitions = useWidgetDefinitions();
  const {
    data: versions,
    isLoading,
    getVersionConfig,
    restore,
    updateVersion,
  } = useWidgetVersions(id, projectId);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [view, setView] = useState<DetailView>('preview');
  const [compareWith, setCompareWith] = useState<string>('current');
  const [versionConfigs, setVersionConfigs] = useState<Record<number, any>>({});
  const [nameInput, setNameInput] = useState('');

  const list = versions || [];
  const newestId = list.length > 0 ? list[0].id : null;
  const selected = list.find((v) => v.id === selectedId) || null;

  const compareVersionId =
    compareWith !== 'current' ? Number(compareWith) : null;
  const baseVersion =
    compareVersionId != null
      ? list.find((v) => v.id === compareVersionId) || null
      : null;
  const selectedConfig =
    selectedId != null ? versionConfigs[selectedId] : undefined;
  const baseConfig =
    compareWith === 'current'
      ? widget?.config
      : compareVersionId != null
        ? versionConfigs[compareVersionId]
        : undefined;

  const baseLabel =
    compareWith === 'current'
      ? 'de huidige configuratie'
      : baseVersion
        ? versionLabel(baseVersion)
        : '';
  const selectedTime = selected ? new Date(selected.createdAt).getTime() : 0;
  const baseTime =
    compareWith === 'current'
      ? Number.POSITIVE_INFINITY
      : baseVersion
        ? new Date(baseVersion.createdAt).getTime()
        : 0;
  const selectedIsOlder = selectedTime <= baseTime;

  useEffect(() => {
    if (!selectedId && list.length > 0) {
      setSelectedId(list[0].id);
    }
  }, [list, selectedId]);

  useEffect(() => {
    if (compareVersionId != null && compareVersionId === selectedId) {
      setCompareWith('current');
    }
  }, [compareVersionId, selectedId]);

  useEffect(() => {
    const needed: number[] = [];
    if (selectedId != null) needed.push(selectedId);
    if (compareVersionId != null) needed.push(compareVersionId);
    const toFetch = needed.filter((nid) => versionConfigs[nid] === undefined);
    if (toFetch.length === 0) return;

    let active = true;
    Promise.all(
      toFetch.map((nid) =>
        getVersionConfig(nid).then((config) => [nid, config] as [number, any])
      )
    ).then((pairs) => {
      if (!active) return;
      setVersionConfigs((prev) => {
        const next = { ...prev };
        pairs.forEach(([nid, config]) => {
          next[nid] = config;
        });
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [selectedId, compareVersionId, versionConfigs, getVersionConfig]);

  useEffect(() => {
    setNameInput(selected?.name || '');
  }, [selectedId, selected?.name]);

  async function handleRestore(versionId: number) {
    const undoVersionId = await restore(versionId);
    if (undoVersionId == null) {
      toast.success('Versie teruggezet');
      return;
    }
    toast.success((t) => (
      <span className="flex items-center gap-3">
        Versie teruggezet
        <button
          type="button"
          className="underline font-medium"
          onClick={() => {
            toast.dismiss(t.id);
            handleRestore(undoVersionId);
          }}>
          Ongedaan maken
        </button>
      </span>
    ));
  }

  async function handleSaveName(versionId: number) {
    const ok = await updateVersion(versionId, { name: nameInput });
    if (ok) toast.success('Naam opgeslagen');
  }

  async function handleToggleProtect(version: WidgetVersion) {
    const ok = await updateVersion(version.id, { pinned: !version.pinned });
    if (ok)
      toast.success(
        version.pinned ? 'Bescherming opgeheven' : 'Versie beschermd'
      );
  }

  const widgetType = widget?.type;
  const widgetDisplayName =
    (widgetType && widgetDefinitions[widgetType]?.name) ||
    widgetType ||
    'Widget';

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          { name: 'Projecten', url: '/projects' },
          { name: 'Widgets', url: `/projects/${projectId}/widgets` },
          {
            name: widgetDisplayName,
            url:
              widgetType && id
                ? `/projects/${projectId}/widgets/${widgetType}/${id}`
                : `/projects/${projectId}/widgets`,
          },
          {
            name: 'Versiegeschiedenis',
            url: `/projects/${projectId}/widgets/version-history/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Paragraph className="text-sm text-muted-foreground mb-4 max-w-3xl">
            Elke keer dat je de widget opslaat, bewaren we hier automatisch een
            versie. Je kunt een eerdere versie bekijken, vergelijken en zo nodig
            terugzetten. Terugzetten kun je daarna direct ongedaan maken.
          </Paragraph>

          {isLoading ? (
            <div className="p-6 bg-white rounded-md">
              <Paragraph>Versiegeschiedenis laden...</Paragraph>
            </div>
          ) : list.length === 0 ? (
            <div className="p-6 bg-white rounded-md">
              <Paragraph>
                Er zijn nog geen versies opgeslagen. Zodra je de configuratie
                een keer opslaat, verschijnt hier de eerste versie.
              </Paragraph>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <div className="bg-white rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <Paragraph className="font-medium">
                      {list.length} versie{list.length === 1 ? '' : 's'}
                    </Paragraph>
                  </div>
                  <ul className="max-h-[70vh] overflow-y-auto">
                    {list.map((version) => {
                      const isSelected = version.id === selectedId;
                      const isCurrent = version.id === newestId;
                      return (
                        <li
                          key={version.id}
                          className={`flex items-stretch border-b border-border ${
                            isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                          }`}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(version.id)}
                            className="flex-1 text-left px-4 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium">
                                {versionLabel(version)}
                              </span>
                              <span className="flex items-center gap-1">
                                {version.pinned ? (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                                    Beschermd
                                  </span>
                                ) : null}
                                {isCurrent ? (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                                    Huidige
                                  </span>
                                ) : null}
                              </span>
                            </div>
                            {version.name && (
                              <div className="text-xs text-muted-foreground">
                                {formatDate(version.createdAt)}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {version.userName ||
                                `Gebruiker #${version.userId || ''}`}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleProtect(version)}
                            title={
                              version.pinned
                                ? 'Beschermd: deze versie wordt niet automatisch opgeruimd. Klik om de bescherming op te heffen.'
                                : 'Beschermen: voorkom dat deze versie automatisch wordt opgeruimd.'
                            }
                            aria-label={
                              version.pinned
                                ? 'Bescherming opheffen'
                                : 'Beschermen tegen opruimen'
                            }
                            className={`px-3 flex items-center ${
                              version.pinned
                                ? 'text-green-600'
                                : 'text-muted-foreground/50 hover:text-muted-foreground'
                            }`}>
                            <Shield
                              className="h-4 w-4"
                              fill={version.pinned ? 'currentColor' : 'none'}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Paragraph className="text-xs text-muted-foreground mt-2 px-1">
                  Bescherm een versie (het schildje) om te voorkomen dat hij
                  automatisch wordt opgeruimd. Van de onbeschermde versies
                  bewaren we de laatste 25.
                </Paragraph>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white rounded-md">
                  {selected ? (
                    <>
                      <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <Paragraph className="font-medium">
                            {versionLabel(selected)}
                            {selected.id === newestId
                              ? ' (huidige versie)'
                              : ''}
                          </Paragraph>
                          <Paragraph className="text-sm text-muted-foreground">
                            Opgeslagen door{' '}
                            {selected.userName ||
                              `Gebruiker #${selected.userId || ''}`}{' '}
                            op {formatDate(selected.createdAt)}
                          </Paragraph>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={view === 'preview' ? 'default' : 'outline'}
                            onClick={() => setView('preview')}>
                            Preview
                          </Button>
                          <Button
                            type="button"
                            variant={view === 'diff' ? 'default' : 'outline'}
                            onClick={() => setView('diff')}>
                            Verschillen
                          </Button>
                        </div>
                      </div>
                      <div className="px-6 py-3 border-b border-border">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Geef deze versie een naam"
                            className="w-64"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={nameInput === (selected.name || '')}
                            onClick={() => handleSaveName(selected.id)}>
                            Naam opslaan
                          </Button>
                          {selected.id !== newestId ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="flex items-center ml-auto"
                              onClick={(e) => e.preventDefault()}>
                              <ConfirmActionDialog
                                buttonText="Terugzetten"
                                header="Versie terugzetten"
                                message={`Weet je zeker dat je "${versionLabel(
                                  selected
                                )}" wilt terugzetten? De huidige configuratie wordt vervangen door deze versie. Dit wordt zelf ook als nieuwe versie opgeslagen, en je kunt het direct daarna ongedaan maken.`}
                                confirmButtonText="Terugzetten"
                                cancelButtonText="Annuleren"
                                confirmButtonVariant="destructive"
                                onConfirmAccepted={() =>
                                  handleRestore(selected.id)
                                }
                              />
                            </Button>
                          ) : null}
                        </div>
                        <Paragraph className="text-xs text-muted-foreground mt-2">
                          Een naam maakt een versie makkelijker terug te vinden.
                          Beschermen tegen opruimen doe je met het schildje in
                          de lijst.
                        </Paragraph>
                      </div>
                      <div className="p-6">
                        {view === 'preview' ? (
                          selectedConfig === undefined ? (
                            <Paragraph className="text-muted-foreground">
                              Configuratie laden...
                            </Paragraph>
                          ) : selectedConfig === null ? (
                            <Paragraph className="text-muted-foreground">
                              Kon de configuratie van deze versie niet laden.
                            </Paragraph>
                          ) : (
                            <WidgetPreview
                              type={widgetType}
                              config={selectedConfig}
                              projectId={projectId}
                            />
                          )
                        ) : (
                          <div>
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Vergelijk met:
                              </span>
                              <div className="w-64">
                                <Select
                                  value={compareWith}
                                  onValueChange={setCompareWith}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="current">
                                      Huidige configuratie
                                    </SelectItem>
                                    {list
                                      .filter((v) => v.id !== selected.id)
                                      .map((v) => (
                                        <SelectItem
                                          key={v.id}
                                          value={String(v.id)}>
                                          {versionLabel(v)}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <VersionDiff
                              olderConfig={
                                selectedIsOlder ? selectedConfig : baseConfig
                              }
                              newerConfig={
                                selectedIsOlder ? baseConfig : selectedConfig
                              }
                              olderLabel={
                                selectedIsOlder
                                  ? versionLabel(selected)
                                  : baseLabel
                              }
                              newerLabel={
                                selectedIsOlder
                                  ? baseLabel
                                  : versionLabel(selected)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-6">
                      <Paragraph>Selecteer een versie.</Paragraph>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
}

function VersionDiff({
  olderConfig,
  newerConfig,
  olderLabel,
  newerLabel,
}: {
  olderConfig: Record<string, any> | undefined | null;
  newerConfig: Record<string, any> | undefined | null;
  olderLabel: string;
  newerLabel: string;
}) {
  if (olderConfig === undefined || newerConfig === undefined) {
    return (
      <Paragraph className="text-sm text-muted-foreground">
        Configuratie laden...
      </Paragraph>
    );
  }

  if (olderConfig === null || newerConfig === null) {
    return (
      <Paragraph className="text-sm text-muted-foreground">
        Kon de configuratie niet laden.
      </Paragraph>
    );
  }

  const olderClean = stripSystemFields(olderConfig, true);
  const newerClean = stripSystemFields(newerConfig, true);

  const hasChanges = JSON.stringify(olderClean) !== JSON.stringify(newerClean);

  if (!hasChanges) {
    return (
      <Paragraph className="text-sm text-muted-foreground">
        Geen verschillen tussen deze versies.
      </Paragraph>
    );
  }

  return (
    <div>
      <Paragraph className="text-xs text-muted-foreground mb-2">
        Van {olderLabel} naar {newerLabel}. Rood doorgestreept is de oude
        waarde, groen de nieuwere.
      </Paragraph>
      <ChangesDisplay
        previousData={olderClean}
        newData={newerClean}
        action="PUT"
      />
    </div>
  );
}
