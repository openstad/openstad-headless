import ChangesDisplay from '@/components/audit-log-diff';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Paragraph } from '@/components/ui/typography';
import { setVersionsTabActive } from '@/components/widget-editor-preview';
import WidgetPreview from '@/components/widget-preview';
import useAreas from '@/hooks/use-areas';
import useChoiceGuideWidgets from '@/hooks/use-choice-guide-widgets';
import useStatuses from '@/hooks/use-statuses';
import useTags from '@/hooks/use-tags';
import { WidgetVersion, useWidgetVersions } from '@/hooks/use-widget-versions';
import {
  IdEntity,
  formatDate,
  idsFromValue,
  resolveIds,
  stripSystemFields,
  summarizeChanges,
  versionLabel,
} from '@/lib/widget-version-helpers';
import {
  Check,
  Lock,
  Maximize2,
  Minimize2,
  Pencil,
  Unlock,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

type WidgetVersionHistoryProps = {
  widgetId?: string | number;
  projectId?: string | number;
};

type DetailView = 'preview' | 'diff';

export default function WidgetVersionHistory({
  widgetId,
  projectId: projectIdProp,
}: WidgetVersionHistoryProps) {
  const id = String(widgetId ?? '');
  const projectId = String(projectIdProp ?? '');

  const { data: widget } = useSWR(
    projectId && id
      ? `/api/openstad/api/project/${projectId}/widgets/${id}?includeType=1`
      : null
  );
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
  const [editingName, setEditingName] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [previewMaxed, setPreviewMaxed] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});

  const { data: tagList } = useTags(projectId);
  const { data: statusList } = useStatuses(projectId);
  const { data: cgList } = useChoiceGuideWidgets(projectId);
  const { data: areaData } = useAreas(projectId);
  const areaList = Array.isArray(areaData) ? areaData : [];
  const [resourceMap, setResourceMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setVersionsTabActive(true);
    return () => setVersionsTabActive(false);
  }, []);

  const list = versions || [];
  const newestId = list.length > 0 ? list[0].id : null;
  const selectedIndex = list.findIndex((v) => v.id === selectedId);
  const selected = selectedIndex >= 0 ? list[selectedIndex] : null;
  const numberById = new Map(list.map((v, i) => [v.id, list.length - i]));

  const idMaps = useMemo(() => {
    const build = (arr: any, nameOf: (x: any) => string) => {
      const map = new Map<string, string>();
      (Array.isArray(arr) ? arr : []).forEach((x: any) => {
        if (x && x.id != null) map.set(String(x.id), nameOf(x));
      });
      return map;
    };
    return {
      tag: build(tagList, (t: any) => t.name || `#${t.id}`),
      status: build(statusList, (s: any) => s.name || `#${s.id}`),
      choiceguide: build(
        cgList,
        (w: any) => w.description || w.name || `#${w.id}`
      ),
      area: build(areaList, (a: any) => a.name || `#${a.id}`),
      resource: new Map<string, string>(Object.entries(resourceMap)),
    } as Record<IdEntity, Map<string, string>>;
  }, [tagList, statusList, cgList, areaData, resourceMap]);

  const resolveCfg = (cfg: any) =>
    cfg && typeof cfg === 'object' ? resolveIds(cfg, idMaps) : cfg;

  const compareVersionId =
    compareWith !== 'current' ? Number(compareWith) : null;
  const baseVersion =
    compareVersionId != null
      ? list.find((v) => v.id === compareVersionId) || null
      : null;
  const selectedConfig =
    selectedId != null ? versionConfigs[selectedId] : undefined;

  const prevVersionId =
    selectedIndex >= 0 && selectedIndex < list.length - 1
      ? list[selectedIndex + 1].id
      : null;
  const prevVersionConfig =
    prevVersionId != null ? versionConfigs[prevVersionId] : undefined;

  let changeSummaryText: string | null = null;
  if (selected) {
    if (selectedIndex === list.length - 1) {
      changeSummaryText = 'Eerste versie';
    } else if (
      selectedConfig === undefined ||
      prevVersionConfig === undefined
    ) {
      changeSummaryText = 'Wijzigingen laden...';
    } else if (selectedConfig !== null && prevVersionConfig !== null) {
      const changed = summarizeChanges(
        resolveCfg(prevVersionConfig),
        resolveCfg(selectedConfig),
        widget?.type
      );
      changeSummaryText = changed ? 'Gewijzigd: ' + changed : null;
    }
  }

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
    if (prevVersionId != null) needed.push(prevVersionId);
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
  }, [
    selectedId,
    compareVersionId,
    prevVersionId,
    versionConfigs,
    getVersionConfig,
  ]);

  useEffect(() => {
    const ids = new Set<string>();
    [selectedConfig, baseConfig, prevVersionConfig].forEach((c) => {
      if (c && typeof c === 'object' && c.resourceId != null)
        idsFromValue(c.resourceId).forEach((rid) => ids.add(rid));
    });
    const missing = Array.from(ids).filter(
      (rid) => resourceMap[rid] === undefined
    );
    if (missing.length === 0) return;

    let active = true;
    Promise.all(
      missing.map((rid) =>
        fetch(`/api/openstad/api/project/${projectId}/resource/${rid}`)
          .then((r) => (r.ok ? r.json() : null))
          .then(
            (d) => [rid, d && d.title ? d.title : `#${rid}`] as [string, string]
          )
          .catch(() => [rid, `#${rid}`] as [string, string])
      )
    ).then((pairs) => {
      if (!active) return;
      setResourceMap((prev) => {
        const next = { ...prev };
        pairs.forEach(([rid, title]) => {
          next[rid] = title;
        });
        return next;
      });
    });
    return () => {
      active = false;
    };
  }, [selectedConfig, baseConfig, prevVersionConfig, projectId, resourceMap]);

  useEffect(() => {
    setNameInput(selected?.name || '');
    setEditingName(false);
  }, [selectedId, selected?.name]);

  async function handleRestore(versionId: number) {
    const { ok, undoVersionId } = await restore(versionId);
    if (!ok) return;

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
    if (ok) {
      toast.success('Naam opgeslagen');
      setEditingName(false);
    }
  }

  function cancelEditName() {
    setNameInput(selected?.name || '');
    setEditingName(false);
  }

  async function handleToggleProtect(version: WidgetVersion) {
    const ok = await updateVersion(version.id, { pinned: !version.pinned });
    if (ok)
      toast.success(
        version.pinned ? 'Versie ontgrendeld' : 'Versie vergrendeld'
      );
  }

  function goToVersion(versionId: number) {
    setPreviewMaxed(false);
    setSelectedId(versionId);
    setHighlightedId(versionId);
    window.setTimeout(() => {
      const el = itemRefs.current[versionId];
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 0);
    window.setTimeout(
      () => setHighlightedId((cur) => (cur === versionId ? null : cur)),
      1600
    );
  }

  const widgetType = widget?.type;

  return (
    <div>
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
            Er zijn nog geen versies opgeslagen. Zodra je de configuratie een
            keer opslaat, verschijnt hier de eerste versie.
          </Paragraph>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {!previewMaxed && (
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
                        ref={(el) => {
                          itemRefs.current[version.id] = el;
                        }}
                        className={`flex items-stretch border-b border-border transition-colors duration-700 ${
                          highlightedId === version.id
                            ? 'bg-yellow-100'
                            : isSelected
                              ? 'bg-muted'
                              : 'hover:bg-muted/50'
                        }`}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(version.id)}
                          className="flex-1 text-left px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <span className="text-xs text-muted-foreground tabular-nums">
                                v{numberById.get(version.id)}
                              </span>
                              {versionLabel(version)}
                            </span>
                            <span className="flex items-center gap-1">
                              {version.restoredFromId ? (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  Teruggezet
                                </span>
                              ) : null}
                              {version.pinned ? (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                                  Vergrendeld
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
                              ? 'Vergrendeld: deze versie wordt niet automatisch opgeruimd. Klik om te ontgrendelen.'
                              : 'Vergrendelen: voorkom dat deze versie automatisch wordt opgeruimd.'
                          }
                          aria-label={
                            version.pinned ? 'Ontgrendelen' : 'Vergrendelen'
                          }
                          className={`px-3 flex items-center ${
                            version.pinned
                              ? 'text-green-600'
                              : 'text-muted-foreground/50 hover:text-muted-foreground'
                          }`}>
                          {version.pinned ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Paragraph className="text-xs text-muted-foreground mt-2 px-1">
                Vergrendel een versie (het slotje) om te voorkomen dat hij
                automatisch wordt opgeruimd. Van de niet-vergrendelde versies
                bewaren we de laatste 25.
              </Paragraph>
            </div>
          )}

          <div className={previewMaxed ? 'lg:col-span-12' : 'lg:col-span-8'}>
            <div className="bg-white rounded-md">
              {selected ? (
                <>
                  <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Paragraph className="font-medium flex items-center gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          v{numberById.get(selected.id)}
                        </span>
                        {editingName ? (
                          <span className="flex items-center gap-1">
                            <Input
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder="Versienaam"
                              autoFocus
                              className="h-8 w-56"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter')
                                  handleSaveName(selected.id);
                                if (e.key === 'Escape') cancelEditName();
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              className="px-2 h-8"
                              aria-label="Naam opslaan"
                              onClick={() => handleSaveName(selected.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="px-2 h-8"
                              aria-label="Annuleren"
                              onClick={cancelEditName}>
                              <X className="h-4 w-4" />
                            </Button>
                          </span>
                        ) : (
                          <>
                            {versionLabel(selected)}
                            {selected.id === newestId
                              ? ' (huidige versie)'
                              : ''}
                            <button
                              type="button"
                              onClick={() => {
                                setNameInput(versionLabel(selected));
                                setEditingName(true);
                              }}
                              title="Naam wijzigen"
                              aria-label="Naam wijzigen"
                              className="text-muted-foreground/60 hover:text-muted-foreground">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </Paragraph>
                      <Paragraph className="text-sm text-muted-foreground">
                        Opgeslagen door{' '}
                        {selected.userName ||
                          `Gebruiker #${selected.userId || ''}`}{' '}
                        op {formatDate(selected.createdAt)}
                      </Paragraph>
                      {changeSummaryText ? (
                        <Paragraph className="text-xs text-muted-foreground mt-1">
                          {changeSummaryText}
                        </Paragraph>
                      ) : null}
                      {selected.restoredFromId != null ? (
                        numberById.has(selected.restoredFromId) ? (
                          <button
                            type="button"
                            onClick={() =>
                              goToVersion(selected.restoredFromId as number)
                            }
                            className="mt-1 inline-block text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                            Teruggezet van versie v
                            {numberById.get(selected.restoredFromId)} (bekijk)
                          </button>
                        ) : (
                          <Paragraph className="mt-1 text-xs text-muted-foreground">
                            Teruggezet van een inmiddels verwijderde versie
                          </Paragraph>
                        )
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center rounded-md bg-muted p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-8 ${
                            view === 'preview'
                              ? 'bg-white shadow-sm text-foreground hover:bg-white'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setView('preview')}>
                          Preview
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-8 ${
                            view === 'diff'
                              ? 'bg-white shadow-sm text-foreground hover:bg-white'
                              : 'text-muted-foreground'
                          }`}
                          onClick={() => setView('diff')}>
                          Verschillen
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="px-2"
                        aria-label={
                          previewMaxed
                            ? 'Tijdlijn tonen'
                            : 'Preview maximaliseren'
                        }
                        title={
                          previewMaxed
                            ? 'Tijdlijn tonen'
                            : 'Preview maximaliseren'
                        }
                        onClick={() => setPreviewMaxed((m) => !m)}>
                        {previewMaxed ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {selected.id !== newestId ? (
                    <div className="px-6 py-3 border-b border-border flex">
                      <Dialog
                        open={restoreDialogOpen}
                        onOpenChange={setRestoreDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="default"
                            className="ml-auto">
                            Terugzetten
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Versie terugzetten</DialogTitle>
                          <DialogDescription>
                            {`Weet je zeker dat je "${versionLabel(
                              selected
                            )}" wilt terugzetten? De huidige configuratie wordt vervangen door deze versie. Dit wordt zelf ook als nieuwe versie opgeslagen, en je kunt het direct daarna ongedaan maken.`}
                          </DialogDescription>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setRestoreDialogOpen(false)}>
                              Annuleren
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => {
                                setRestoreDialogOpen(false);
                                handleRestore(selected.id);
                              }}>
                              Terugzetten
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : null}
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
                          key={selected.id}
                          type={widgetType}
                          config={selectedConfig}
                          projectId={projectId}
                        />
                      )
                    ) : null}
                    {view === 'diff' ? (
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
                                    <SelectItem key={v.id} value={String(v.id)}>
                                      {versionLabel(v)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <VersionDiff
                          olderConfig={resolveCfg(
                            selectedIsOlder ? selectedConfig : baseConfig
                          )}
                          newerConfig={resolveCfg(
                            selectedIsOlder ? baseConfig : selectedConfig
                          )}
                          olderLabel={
                            selectedIsOlder ? versionLabel(selected) : baseLabel
                          }
                          newerLabel={
                            selectedIsOlder ? baseLabel : versionLabel(selected)
                          }
                          widgetType={widgetType}
                        />
                      </div>
                    ) : null}
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
  );
}

function VersionDiff({
  olderConfig,
  newerConfig,
  olderLabel,
  newerLabel,
  widgetType,
}: {
  olderConfig: Record<string, any> | undefined | null;
  newerConfig: Record<string, any> | undefined | null;
  olderLabel: string;
  newerLabel: string;
  widgetType?: string;
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
        widgetType={widgetType}
      />
    </div>
  );
}
