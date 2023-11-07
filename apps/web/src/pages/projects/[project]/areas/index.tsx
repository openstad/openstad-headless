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
            <Button variant="default">
              <Plus size="20" />
              Gebied toevoegen
            </Button>
          </Link>
        }>
        <div className="container mx-auto ">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 px-2 border-b border-border">
            <ListHeading className="hidden md:flex md:col-span-2">
              ID
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-2">
              Naam
            </ListHeading>
          </div>
        </div>
        <ul className="container mx-auto">
          {data?.map((area: any) => (
            <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
              <Paragraph className="hidden md:flex md:col-span-2">
                {area.id}
              </Paragraph>
              <Paragraph className="hidden md:flex md:col-span-2">
                {area.name}
              </Paragraph>
            </li>
          ))}
        </ul>
      </PageLayout>
    </div>
  );
}
