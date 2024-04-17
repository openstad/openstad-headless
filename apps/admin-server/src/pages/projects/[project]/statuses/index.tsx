import { PageLayout } from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useStatuses from '@/hooks/use-statuses';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';
import { sortTable } from '@/components/ui/sortTable';

export default function ProjectStatuses() {
  const router = useRouter();
  const { project } = router.query;

  const { data, isLoading, removeStatus } = useStatuses(project as string);

  const [filterData, setFilterData] = useState(data);

  useEffect(() => {
    setFilterData(data);
  }, [data])

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
          },
          {
            name: 'Statuses',
            url: `/projects/${project}/statuses`,
          },
        ]}
        action={
          <Link href={`/projects/${project}/statuses/create`} className="flex w-fit">
            <Button variant="default">
              <Plus size="20" className="hidden lg:flex" />
              Status toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
                  Naam
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((status: any) => (
                <Link
                  href={`/projects/${project}/statuses/${status.id}`}
                  key={status.id}>
                  <li key={status.id} className="grid grid-cols-2 lg:grid-cols-4 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="my-auto -mr-16 lg:mr-0">{status.id || null}</Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">{status.name || null}</Paragraph>
                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Status verwijderen"
                        message="Weet je zeker dat je deze status wilt verwijderen?"
                        onDeleteAccepted={() =>
                          removeStatus(status.id)
                            .then(() =>
                              toast.success('Status successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Status kon niet worden verwijderd')
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
  )
}
