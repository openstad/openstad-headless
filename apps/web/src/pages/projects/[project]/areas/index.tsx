import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useArea from '@/hooks/use-area';

export default function ProjectAreas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading } = useArea(project as string);

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
            name: 'Gebieden',
            url: `/projects/${project}/areas`,
          },
        ]}
        action={
          <Link href={`/projects/${project}/areas/create`}>
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Gebied toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-3 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">ID</ListHeading>
              <ListHeading className="hidden lg:flex">Naam</ListHeading>
            </div>

            <ul>
              {data?.map((area: any) => (
                <li className="grid grid-cols-2 lg:grid-cols-3 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <Paragraph className="hidden lg:flex truncate">
                    {area.id}
                  </Paragraph>
                  <Paragraph className="flex truncate -mr-16">
                    {area.name}
                  </Paragraph>
                  <Paragraph className="flex">
                    <ChevronRight
                      strokeWidth={1.5}
                      className="w-5 h-5 my-auto ml-auto"
                    />
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
