import { PageLayout } from '../../../components/ui/page-layout';
import useSWR from 'swr';
import React from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useVotes from '@/hooks/use-votes';

export default function ProjectIdeas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading } = useVotes(project as string);

  if (!data) return null;

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
        <div className="container mx-auto py-10">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
            <ListHeading className="hidden md:flex md:col-span-3">
              Stem ID
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-2">
              Stemdatum
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-2">
              Plan ID
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-2">
              Gebruiker ID
            </ListHeading>
          </div>
          <ul>
            {data?.map((vote: any) => (
              <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                <div className="col-span-3">
                  <Paragraph>{vote.id}</Paragraph>
                </div>
                <Paragraph className="hidden md:flex md:col-span-2">
                  {vote.createdAt}
                </Paragraph>
                <Paragraph className="hidden md:flex md:col-span-2">
                  {vote.ideaId}
                </Paragraph>
                <Paragraph className="hidden md:flex md:col-span-3">
                  {vote.userId}
                </Paragraph>
              </li>
            ))}
          </ul>
        </div>
      </PageLayout>
    </div>
  );
}
