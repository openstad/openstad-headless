import React from 'react';
import { PageLayout } from '../../../components/ui/page-layout';

import { Button } from '../../../components/ui/button';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import { useProject } from '@/hooks/use-project';
import useVotes from '@/hooks/use-votes';
import useIdeas from '@/hooks/use-ideas';
import useTags from '@/hooks/use-tags';
import useComments from '@/hooks/use-comments';
import usePolls from '@/hooks/use-poll';

export default function ProjectExport() {
  const router = useRouter();
  const { project } = router.query;    

  // Function to export data as a file
  const exportData = (data: any, fileName: any, type: any) => {
    // Create a link and download the file
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { data, isLoading } = useProject();
  const { data: projectVotes, isLoading: isLoadingVotes } = useVotes(project as string);
  const { data: projectIdeas, isLoading: isLoadingIdeas } = useIdeas(project as string);
  const { data: projectTags, isLoading: isLoadingTags } = useTags(project as string);
  const { data: projectComments, isLoading: isLoadingComments } = useComments(project as string);
  const { data: projectPolls, isLoading: isLoadingPolls } = usePolls(project as string);


  function transform() {
    const totalData = {data, projectVotes, projectIdeas, projectTags, projectComments, projectPolls};
    const jsonData = JSON.stringify(totalData);
    exportData(jsonData, "test.json", "application/json");
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