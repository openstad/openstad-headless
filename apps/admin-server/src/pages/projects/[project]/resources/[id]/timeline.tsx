import {
  AgendaItem,
  AgendaItemsEditor,
} from '@/components/agenda-items-editor';
import { Button } from '@/components/ui/button';
import useResource from '@/hooks/use-resource';
import useResources from '@/hooks/use-resources';
import { withId } from '@/lib/widget-item-helpers';
import { fillTimelineEndDates } from '@openstad-headless/lib/timeline-dates';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProjectResourceTimeline() {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: resource, mutate } = useResource(
    project as string,
    id as string
  );
  const { update } = useResources(project as string, {
    includeGlobalTags: true,
    skipFetch: true,
  });

  const [items, setItems] = useState<AgendaItem[]>([]);

  const itemsInitialized = React.useRef(false);
  useEffect(() => {
    if (!resource || itemsInitialized.current) return;
    itemsInitialized.current = true;
    setItems(
      fillTimelineEndDates(
        (resource?.timeline ?? []).map(withId)
      ) as AgendaItem[]
    );
  }, [resource?.id]);

  function handleItemsChange(next: AgendaItem[]) {
    setItems(fillTimelineEndDates(next));
  }

  async function handleSave() {
    if (!id) return;

    try {
      await update(Number.parseInt(id as string), {
        timeline: fillTimelineEndDates(items),
      });
      itemsInitialized.current = false;
      mutate();
      toast.success('Tijdlijn opgeslagen');
    } catch {
      toast.error('Tijdlijn kon niet worden opgeslagen');
    }
  }

  if (!resource) return null;

  return (
    <div>
      <AgendaItemsEditor
        items={items}
        onItemsChange={handleItemsChange}
        showActiveDates={true}
        timelineMode={true}
      />
      <div className="flex gap-2 mt-4">
        <Button type="button" onClick={handleSave}>
          Opslaan
        </Button>
      </div>
    </div>
  );
}
