import { PageLayout } from '../../../components/ui/page-layout';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useVotes from '@/hooks/use-votes';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { data, remove } = useVotes(project as string);

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

  function transform() {
    const jsonData = JSON.stringify(data);
    exportData(jsonData, `votes.json`, "application/json");
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
            name: 'Stemmen',
            url: `/projects/${project}/votes`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto'>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer stemmen
            </Button>
          </div>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Stem ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                Stemdatum
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Plan ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Gebruiker ID
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Gebruiker IP
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                Voorkeur
              </ListHeading>
            </div>
            <ul>
              {data?.map((vote: any) => {
                return (
                  <li
                    key={vote.id}
                    className="grid grid-cols-3 lg:grid-cols-8 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="col-span-1 truncate">
                      <Paragraph>{vote.id}</Paragraph>
                    </div>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                      {vote.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {vote.resourceId}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {vote.userId}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {vote.ip}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                      {vote.opinion}
                    </Paragraph>
                    <div
                      onClick={(e) => e.preventDefault()}
                      className="hidden lg:flex ml-auto">
                      <RemoveResourceDialog
                        header="Stem verwijderen"
                        message="Weet je zeker dat je deze stem wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(vote.id)
                            .then(() =>
                              toast.success('Stem successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Stem kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
