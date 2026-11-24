import useProjectList from '@/hooks/use-project-list';
import { useWidgetDefinitions } from '@/hooks/use-widget-definitions';
import { Widget, WidgetCopyResult, useWidgetsHook } from '@/hooks/use-widgets';
import { AlertTriangle, Import } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type Props = {
  projectId: string;
  copyWidgets: (
    sourceProjectId: number,
    ids: number[]
  ) => Promise<WidgetCopyResult>;
};

const CLEARED_KEY_LABELS: Record<string, string> = {
  resourceId: 'gekoppelde inzending',
  choiceguideWidgetId: 'gekoppelde keuzewijzer',
  widgetToFetchId: 'gekoppelde widget',
  widgetId: 'gekoppelde widget',
  markerSets: 'markersets',
};

function clearedKeyLabel(keyPath: string) {
  const key = keyPath.split('.').pop() || keyPath;
  if (CLEARED_KEY_LABELS[key]) return CLEARED_KEY_LABELS[key];
  if (/Tag/.test(key)) return 'tags';
  if (/Status/.test(key)) return 'statussen';
  return key;
}

function importedMessage({ widgets }: WidgetCopyResult) {
  return `${widgets.length} ${widgets.length === 1 ? 'widget' : 'widgets'} geïmporteerd.`;
}

function clearedMessage(cleared: WidgetCopyResult['cleared']) {
  const perWidget = cleared.map((widget) => {
    const labels = widget.keys
      .map(clearedKeyLabel)
      .filter((label, index, all) => all.indexOf(label) === index);
    return `${widget.description} (${labels.join(', ')})`;
  });
  return `Niet alles kon worden meegenomen, controleer deze widgets: ${perWidget.join('; ')}.`;
}

export function ImportWidgetDialog({ projectId, copyWidgets }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex w-fit">
          <Import size="20" className="hidden lg:flex" />
          Widget importeren uit ander project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ImportWidgetDialogBody
          projectId={projectId}
          copyWidgets={copyWidgets}
          onImported={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ImportWidgetDialogBody({
  projectId,
  copyWidgets,
  onImported,
}: Props & { onImported: () => void }) {
  const [sourceProjectId, setSourceProjectId] = useState<string>();
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<number[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const importInFlight = useRef(false);

  const widgetDefinitions = useWidgetDefinitions();
  const { data: projects, isLoading: isLoadingProjects } = useProjectList();
  const {
    data: sourceWidgets,
    isLoading: isLoadingSourceWidgets,
    error: sourceWidgetsError,
  } = useWidgetsHook(sourceProjectId);

  const otherProjects = (projects || []).filter(
    (project: { id: number }) => String(project.id) !== String(projectId)
  );
  const allWidgetIds: number[] = (sourceWidgets || []).map(
    (widget: Widget) => widget.id
  );
  const allSelected =
    allWidgetIds.length > 0 && selectedWidgetIds.length === allWidgetIds.length;

  function toggleWidget(widgetId: number, checked: boolean) {
    setSelectedWidgetIds((previous) =>
      checked
        ? [...previous, widgetId]
        : previous.filter((id) => id !== widgetId)
    );
  }

  async function onImport() {
    if (!sourceProjectId || selectedWidgetIds.length === 0) return;
    if (importInFlight.current) return;
    importInFlight.current = true;
    setIsImporting(true);

    try {
      const result = await copyWidgets(
        parseInt(sourceProjectId, 10),
        selectedWidgetIds
      );
      toast.success(importedMessage(result));
      if (result.cleared.length > 0) {
        toast(clearedMessage(result.cleared), {
          duration: 10000,
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        });
      }
      onImported();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      importInFlight.current = false;
      setIsImporting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Widget importeren uit ander project</DialogTitle>
        <DialogDescription>
          Kies een bronproject en selecteer de widgets die je wilt importeren in
          dit project. Koppelingen met tags, statussen, markersets en
          inzendingen van het bronproject worden niet meegenomen.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <label
            className="text-sm font-medium"
            htmlFor="import-source-project">
            Bronproject
          </label>
          <Select
            value={sourceProjectId}
            onValueChange={(value) => {
              setSourceProjectId(value);
              setSelectedWidgetIds([]);
            }}>
            <SelectTrigger id="import-source-project">
              <SelectValue placeholder="Selecteer een project" />
            </SelectTrigger>
            <SelectContent className="overflow-y-auto max-h-[16rem]">
              {otherProjects.map((project: { id: number; name: string }) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isLoadingProjects && otherProjects.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Er zijn geen andere projecten waaruit je kunt importeren.
            </p>
          )}
        </div>

        {sourceProjectId && (
          <fieldset>
            <legend className="text-sm font-medium">Widgets</legend>
            <div aria-live="polite">
              {isLoadingSourceWidgets && (
                <p className="text-sm text-muted-foreground">
                  Widgets laden...
                </p>
              )}
              {!isLoadingSourceWidgets && sourceWidgetsError && (
                <p className="text-sm text-destructive">
                  De widgets van dit project konden niet worden opgehaald.
                </p>
              )}
              {!isLoadingSourceWidgets &&
                !sourceWidgetsError &&
                allWidgetIds.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Dit project heeft geen widgets.
                  </p>
                )}
            </div>

            {allWidgetIds.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Checkbox
                    id="import-widget-all"
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                      setSelectedWidgetIds(checked === true ? allWidgetIds : [])
                    }
                  />
                  <label
                    htmlFor="import-widget-all"
                    className="text-sm font-medium">
                    Alles selecteren
                  </label>
                </div>
                <div className="max-h-[16rem] overflow-y-auto space-y-2">
                  {sourceWidgets.map((widget: Widget) => (
                    <div key={widget.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`import-widget-${widget.id}`}
                        checked={selectedWidgetIds.includes(widget.id)}
                        onCheckedChange={(checked) =>
                          toggleWidget(widget.id, checked === true)
                        }
                      />
                      <label
                        htmlFor={`import-widget-${widget.id}`}
                        className="text-sm font-normal">
                        {widget.description}{' '}
                        <span className="text-muted-foreground">
                          ({widgetDefinitions[widget.type]?.name})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </fieldset>
        )}
      </div>

      <DialogFooter>
        <Button
          disabled={selectedWidgetIds.length === 0 || isImporting}
          onClick={onImport}>
          Importeren
        </Button>
      </DialogFooter>
    </>
  );
}
