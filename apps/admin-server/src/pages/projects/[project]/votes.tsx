import { PageLayout } from '../../../components/ui/page-layout';
import React from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useVotes from '@/hooks/use-votes';
import { ChevronRight } from 'lucide-react';

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { data } = useVotes(project as string);

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
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-7 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-2">
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
            </div>
            <ul>
              {data?.map((vote: any) => (
                <li key={vote.id} className="grid grid-cols-3 lg:grid-cols-7 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <div className="col-span-2 truncate">
                    <Paragraph>{vote.id}</Paragraph>
                  </div>
                  <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                    {vote.createdAt}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                    {vote.resourceId}
                  </Paragraph>
                  <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                    {vote.userId}
                  </Paragraph>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
