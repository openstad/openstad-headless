import React from 'react';
import { PageLayout } from '../../../components/ui/page-layout';

import { Button } from '../../../components/ui/button';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useExport from '@/hooks/use-export';

export default function ProjectExport() {
  const router = useRouter();
  const { project } = router.query;    

  // Function to export data as a file
  const exportData = (data: BlobPart, fileName: string, type: string) => {
    // Create a link and download the file
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const { data, isLoading } = useExport(project as string);


  function transform() {
    const jsonData = JSON.stringify(data);
    exportData(jsonData, `${data.name}.json`, "application/json");
  }

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Exporteren',
            url: `/projects/${project}/export`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <Heading size="xl">Exporteren</Heading>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 w-fit">
              <div className="col-span-full">
                <div>
                  De volgende gegevens worden geëxporteerd.
                  <ul className="list-disc">
                    <li className="ml-4">Projectgegevens</li>
                    <li className="ml-4">Plannen</li>
                    <li className="ml-4">Comments per plan</li>
                    <li className="ml-4">Polls per plan</li>
                    <li className="ml-4">Stemmen per plan</li>
                    <li className="ml-4">Tags</li>
                    <li className="ml-4">Actions</li>
                  </ul>
                </div>
              </div>
              <Button className="w-fit col-span-full mt-4" type="submit" onClick={transform}>
                Opslaan
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}