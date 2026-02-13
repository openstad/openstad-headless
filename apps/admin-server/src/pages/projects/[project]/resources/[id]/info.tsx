import ResourceForm from '@/components/resource-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useResource from '@/hooks/use-resource';
import useResources from '@/hooks/use-resources';
import { useRouter } from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';

export default function ProjectResourceCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { update } = useResources(project as string, true);
  const { data: resource, mutate } = useResource(
    project as string,
    id as string
  );

  async function markAsNotSpam() {
    if (!id) return;

    const payload: Record<string, any> = {
      isSpam: false,
    };

    if (!resource?.publishDate) {
      payload.publishDate = new Date();
    }

    try {
      await update(Number.parseInt(id as string), payload);
      toast.success('Inzending gemarkeerd als geen spam');
      mutate();
    } catch (e) {
      toast.error('Kon spamstatus niet aanpassen');
    }
  }

  return id ? (
    <div>
      {resource?.isSpam ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Waarschuwing: waarschijnlijk spam</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>
              Deze inzending is gemarkeerd als spam. Je kunt dit herstellen als
              dit een geldige inzending is.
            </span>
            <Button type="button" variant="outline" onClick={markAsNotSpam}>
              Markeer als geen spam
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <ResourceForm
        onFormSubmit={(values) => update(Number.parseInt(id as string), values)}
      />
    </div>
  ) : null;
}
