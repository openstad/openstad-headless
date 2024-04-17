import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useArea from '@/hooks/use-areas';
import toast from 'react-hot-toast';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { sortTable, searchTable } from '@/components/ui/sortTable';

export default function ProjectAreas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, removeArea } = useArea(project as string);

  const [filterData, setFilterData] = useState(data);
  const debouncedSearchTable = searchTable(setFilterData);

  useEffect(() => {
    setFilterData(data);
  }, [data])

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

        <input
            type="text"
            className='mb-4 p-2 rounded float-right'
            placeholder="Zoeken..."
            onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
          />

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
              <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
              <button className="filter-button" onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
                  Naam
                </button>
              </ListHeading>
            </div>

            <ul>
              {filterData?.map((area: any) => (
                <Link
                  href={`/projects/${project}/areas/${area.id}`}
                  key={area.id}>
                  <li key={area.id} className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
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
                        header="Gebied verwijderen"
                        message="Weet je zeker dat je deze gebied wilt verwijderen?"
                        onDeleteAccepted={() =>
                          removeArea(area.id)
                            .then(() =>
                              toast.success('Gebied successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Gebied kon niet worden verwijderd')
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
