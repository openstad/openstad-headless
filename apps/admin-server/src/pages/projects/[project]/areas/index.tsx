import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useArea from '@/hooks/use-areas';
import toast from 'react-hot-toast';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';

export default function ProjectAreas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, removeArea } = useArea(project as string);

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
            name: 'Polygonen',
            url: `/projects/${project}/areas`,
          },
        ]}
        action={
          <Link href={`/projects/${project}/areas/create`}>
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Polygon toevoegen
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
                <Link
                  href={`/projects/${project}/areas/${area.id}`}
                  key={area.id}>
                  <li key={area.id} className="grid grid-cols-2 lg:grid-cols-3 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="hidden lg:flex truncate">
                      {area.id}
                    </Paragraph>
                    <Paragraph className="flex truncate -mr-16">
                      {area.name}
                    </Paragraph>
                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Stem verwijderen"
                        message="Weet je zeker dat je deze stem wilt verwijderen?"
                        onDeleteAccepted={() =>
                          removeArea(area.id)
                            .then(() =>
                              toast.success('Stem successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Stem kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
                    <Paragraph className="flex">
                      <ChevronRight
                        strokeWidth={1.5}
                        className="w-5 h-5 my-auto ml-auto"
                      />
                    </Paragraph>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
