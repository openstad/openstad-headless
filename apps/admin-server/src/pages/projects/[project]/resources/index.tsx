import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React, { use, useEffect, useState } from 'react';
import useResources from '@/hooks/use-resources';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { toast } from 'react-hot-toast';

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading, remove } = useResources(project as string);

  const exportData = (data: BlobPart, fileName: string, type: string) => {
    // Create a link and download the file
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  function transform() {
    const jsonData = JSON.stringify(data);
    exportData(jsonData, `resources.json`, "application/json");
  }

  const [filterData, setFilterData] = useState<any[]>([]);

  useEffect(() => {
    setFilterData(data);
  }, [data])

  if (!data) return null;

  const sortFunctions = {
    'date-added': (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    'id': (a: any, b: any) => b.id - a.id,
    'resource': (a: any, b: any) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()),
    'voted-yes': (a: any, b: any) => b.resource?.yes || 0 - a.resource?.yes || 0,
    'voted-no': (a: any, b: any) => b.resource?.no || 0 - a.resource?.no || 0,
  };


  const sortTable = (sortType: string, el: MouseEvent<HTMLElement>) => {
    const sortFunction = sortFunctions[sortType as keyof typeof sortFunctions];
    if (!sortFunction) {
      console.error(`Invalid sortType: ${sortType}`);
      return;
    }

    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => button.classList.remove('font-bold'));
    filterButtons.forEach(button => button.classList.remove('text-black'));

    el.currentTarget.classList.toggle('--up');
    el.currentTarget.classList.add('font-bold');
    el.currentTarget.classList.add('text-black');

    const direction = el.currentTarget.classList.contains('--up') ? 'up' : 'down';

    const sortedWidgets = [...filterData].sort((a: any, b: any) => {
      const result = sortFunction(a, b);
      return direction === 'up' ? result : -result;
    });

    setFilterData(sortedWidgets);
  };


  return (
    <div>
      <PageLayout
        pageHeader="Resources"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Resources',
            url: `/projects/${project}/resources`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto gap-4'>
            <Link
              href={`/projects/${project}/resources/create`}>
              <Button variant="default" className='text-xs p-2 w-fit'>
                <Plus size="20" className="hidden lg:flex" />
                Resource toevoegen
              </Button>
            </Link>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer resources
            </Button>
          </div>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-2 lg:grid-cols-[40px_repeat(6,1fr)] items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => sortTable('id', e)}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => sortTable('resource', e)}>
                  Resources
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => sortTable('voted-yes', e)}>
                  Gestemd op ja
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => sortTable('voted-no', e)}>
                  Gestemd op nee
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => sortTable('date-added', e)}>
                  Datum aangemaakt
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
            </div>
            <ul>
              {filterData?.map((resource: any) => (
                <Link
                  href={`/projects/${project}/resources/${resource.id}`}
                  key={resource.id}>
                  <li className="grid grid-cols-2 lg:grid-cols-[40px_repeat(6,1fr)] py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      {resource.id}
                    </Paragraph>
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      {resource.title}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      {resource.yes || 0}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      {resource.no || 0}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                      {resource.createDateHumanized}
                    </Paragraph>

                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Resource verwijderen"
                        message="Weet je zeker dat je deze resource wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(resource.id)
                            .then(() =>
                              toast.success('Resource successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Resource kon niet worden verwijderd')
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
