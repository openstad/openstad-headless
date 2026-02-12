import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWidgetsHook, Widget } from '@/hooks/use-widgets';
import { WidgetDefinitions, WidgetDefinition } from '@/lib/widget-definitions';
import WidgetPreview from '@/components/widget-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RESOURCE_DETAIL_TYPES: WidgetDefinition[] = ['resourcedetail'];

function getWidgetLabel(widget: Widget): string {
  return (
    widget.description ||
    `${WidgetDefinitions[widget.type]?.name || widget.type} (Widget ${widget.id})`
  );
}

export default function ProjectResourcePreview() {
  const router = useRouter();
  const projectId = router.query.project as string;
  const resourceId = router.query.id as string;

  const { data: widgets, isLoading } = useWidgetsHook(projectId);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>();

  const resourceDetailWidgets = useMemo(() => {
    if (!widgets || !Array.isArray(widgets)) return [];
    return widgets.filter((w: Widget) =>
      RESOURCE_DETAIL_TYPES.includes(w.type)
    );
  }, [widgets]);

  useEffect(() => {
    if (!selectedWidgetId && resourceDetailWidgets.length > 0) {
      setSelectedWidgetId(String(resourceDetailWidgets[0].id));
    }
  }, [resourceDetailWidgets, selectedWidgetId]);

  const selectedWidget = resourceDetailWidgets.find(
    (w) => String(w.id) === selectedWidgetId
  );

  const previewConfig = selectedWidget
    ? { ...(selectedWidget.config as object), resourceId }
    : null;

  if (isLoading) {
    return <p className="p-6">Laden...</p>;
  }

  if (resourceDetailWidgets.length === 0) {
    return (
      <div className="p-6 bg-white rounded-md">
        <p>
          Er zijn geen resource detail widgets geconfigureerd in dit project.
          Maak eerst een widget aan van het type &quot;Inzending
          detailpagina&quot;.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 bg-white rounded-md mb-4">
        <label className="text-sm font-medium mb-2 block">
          Selecteer een widget om de inzending te previewen
        </label>
        <Select
          onValueChange={setSelectedWidgetId}
          value={selectedWidgetId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Kies een widget..." />
          </SelectTrigger>
          <SelectContent className="overflow-y-auto max-h-[16rem]">
            {resourceDetailWidgets.map((w) => (
              <SelectItem key={w.id} value={String(w.id)}>
                {getWidgetLabel(w)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {previewConfig && selectedWidget && (
        <WidgetPreview
          type={selectedWidget.type}
          config={previewConfig}
          projectId={projectId}
        />
      )}
    </div>
  );
}
