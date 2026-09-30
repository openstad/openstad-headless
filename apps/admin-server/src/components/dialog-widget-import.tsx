import useProjectList from '@/hooks/use-project-list';
import { useWidgetDefinitions } from '@/hooks/use-widget-definitions';
import { useWidgetsHook } from '@/hooks/use-widgets';
import { Import } from 'lucide-react';
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
  copyWidgets: (sourceProjectId: number, ids: number[]) => Promise<any>;
};

// The endpoint's messages are English, like the rest of the API. Map them to the
// Dutch the admin interface uses everywhere else, by status rather than by text.
function importErrorMessage(error: unknown) {
  const status = (error as { status?: number })?.status;
  if (status === 403) return 'Je mag geen widgets uit dit project importeren.';
  if (status === 404) return 'De geselecteerde widgets bestaan niet meer.';
  if (status === 400) return 'De selectie is ongeldig. Kies opnieuw.';
  return 'Widgets konden niet worden geïmporteerd.';
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
        {/* The body lives in its own component so its data hooks only run while
            the dialog is open, and so closing it resets the selection. */}
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
  // undefined, not '': Radix Select only renders its placeholder while the value
  // is strictly undefined, so an empty string leaves the trigger blank.
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
    (project: any) => String(project.id) !== String(projectId)
  );

  function toggleWidget(widgetId: number, checked: boolean) {
    setSelectedWidgetIds((prev) =>
      checked ? [...prev, widgetId] : prev.filter((id) => id !== widgetId)
    );
  }

  async function onImport() {
    if (!sourceProjectId || selectedWidgetIds.length === 0) return;
    // The disabled state only takes effect on the next render, so a second click
    // in the same tick would send a second POST and create duplicate copies.
    if (importInFlight.current) return;
    importInFlight.current = true;
    setIsImporting(true);
    try {
      const copied = await copyWidgets(
        parseInt(sourceProjectId, 10),
        selectedWidgetIds
      );
      // Report the number actually copied: a widget deleted since the list was
      // loaded is skipped server-side, and an unqualified "done" would hide that.
      const copiedCount = Array.isArray(copied) ? copied.length : 0;
      toast.success(
        copiedCount === selectedWidgetIds.length
          ? 'Widgets succesvol geïmporteerd'
          : `${copiedCount} van ${selectedWidgetIds.length} widgets geïmporteerd`
      );
      onImported();
    } catch (error) {
      console.error('[widget-import]', error);
      toast.error(importErrorMessage(error));
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
          dit project.
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
              {otherProjects.map((project: any) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* A user who administers only this project has nothing to import
              from, which an empty dropdown does not explain. */}
          {!isLoadingProjects && otherProjects.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Er zijn geen andere projecten waaruit je kunt importeren.
            </p>
          )}
        </div>

        {sourceProjectId && (
          <div>
            <p className="text-sm font-medium" id="import-widgets-label">
              Widgets
            </p>
            {/* The loading/empty/error text replaces the list, so it is
                announced rather than only shown. */}
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
                sourceWidgets?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Dit project heeft geen widgets.
                  </p>
                )}
            </div>
            <ul
              className="max-h-[16rem] overflow-y-auto space-y-2 mt-2"
              role="group"
              aria-labelledby="import-widgets-label">
              {sourceWidgets?.map((widget: any) => (
                <li key={widget.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`import-widget-${widget.id}`}
                    checked={selectedWidgetIds.includes(widget.id)}
                    onCheckedChange={(checked) =>
                      toggleWidget(widget.id, !!checked)
                    }
                  />
                  <label htmlFor={`import-widget-${widget.id}`}>
                    <strong>{widget.description}</strong>{' '}
                    <span className="text-sm text-muted-foreground">
                      ({widgetDefinitions[widget.type]?.name})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
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
