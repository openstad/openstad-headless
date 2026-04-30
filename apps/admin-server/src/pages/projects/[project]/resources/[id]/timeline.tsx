import {
  AgendaItem,
  AgendaItemsEditor,
} from '@/components/agenda-items-editor';
import { Button } from '@/components/ui/button';
import useResource from '@/hooks/use-resource';
import useResources from '@/hooks/use-resources';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!resource) return;
    setItems(resource?.timeline ?? []);
  }, [resource?.id]);

  async function handleSave() {
    if (!id) return;

    try {
      await update(Number.parseInt(id as string), {
        timeline: items,
      });
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
        onItemsChange={setItems}
        showActiveDates={true}
      />
      <div className="flex gap-2 mt-4">
        <Button type="button" onClick={handleSave}>
          Opslaan
        </Button>
      </div>
    </div>
  );
}
