import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import React from 'react';
import useIdeas from '@/hooks/use-ideas';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';

export default function ProjectIdeas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading } = useIdeas(project as string);

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Plannen"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Plannen',
            url: `/projects/${project}/ideas`,
          },
        ]}
        action={
          <Link href={`/projects/${project}/ideas/create`}>
            <Button variant="default">
              <Plus size="20" />
              Maak een idee aan
            </Button>
          </Link>
        }>
        <div className="container mx-auto py-10">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
            <ListHeading className="hidden md:flex md:col-span-3">
              Plannen
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-3">
              Ja
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-3">
              Nee
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-3">
              Datum aangemaakt
            </ListHeading>
          </div>

          <ul>
            {data?.map((idea: any) => (
              <Link
                key={idea.id}
                href={`/projects/${project}/ideas/${idea.id}`}>
                <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <div className="col-span-3">
                    <Paragraph>{idea.title}</Paragraph>
                  </div>
                  <Paragraph className="hidden md:flex md:col-span-3">
                    {idea.yes || 0}
                  </Paragraph>
                  <Paragraph className="hidden md:flex md:col-span-3">
                    {idea.no || 0}
                  </Paragraph>
                  <Paragraph className="hidden md:flex md:col-span-3">
                    {idea.createDateHumanized}
                  </Paragraph>
                </li>
              </Link>
            ))}
          </ul>
        </div>
      </PageLayout>
    </div>
  );
}
