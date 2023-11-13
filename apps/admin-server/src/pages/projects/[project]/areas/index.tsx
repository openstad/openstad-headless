import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden md:flex">ID</ListHeading>
              <ListHeading className="hidden md:flex">Naam</ListHeading>
            </div>

            <ul>
              {data?.map((area: any) => (
                <li
                  className="grid grid-cols-1 lg:grid-cols-2 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                  key={area.id}>
                  <Paragraph className="hidden md:flex truncate">
                    {area.id}
                  </Paragraph>
                  <Paragraph className="flex truncate">{area.name}</Paragraph>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
