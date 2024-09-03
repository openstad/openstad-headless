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
import { sortTable, searchTable } from '@/components/ui/sortTable';
import * as XLSX from 'xlsx';
import flattenObject from "@/lib/export-helpers/flattenObject";

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading, remove } = useResources(project as string);

  const exportData = (data: any[], fileName: string) => {

    const flattenedData = data.map(item => flattenObject(item));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, fileName);
  };

  function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');

    exportData(data, `${projectId}_resources_${formattedDate}.xlsx`);
  }

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    setFilterData(data);
  }, [data])

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Inzendingen"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Inzendingen',
            url: `/projects/${project}/resources`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto gap-4'>
            <Link
              href={`/projects/${project}/resources/create`}>
              <Button variant="default" className='text-xs p-2 w-fit'>
                <Plus size="20" className="hidden lg:flex" />
                Inzending toevoegen
              </Button>
            </Link>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer inzendingen
            </Button>
          </div>
        }>
        <div className="container py-6">

          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}
            >
              <option value="">Alles</option>
              <option value="id">Stem ID</option>
              <option value="title">Inzendingen</option>
              <option value="yes">Gestemd op ja</option>
              <option value="no">Gestemd op nee</option>
              <option value="createdAt">Datum aangemaakt</option>


            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-2 lg:grid-cols-7 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('resource', e, filterData))}>
                  Inzendingen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('voted-yes', e, filterData))}>
                  Gestemd op ja
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('voted-no', e, filterData))}>
                  Gestemd op nee
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('date-added', e, filterData))}>
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
                  <li className="grid grid-cols-2 lg:grid-cols-7 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
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
                        header="Inzending verwijderen"
                        message="Weet je zeker dat je deze inzending wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(resource.id)
                            .then(() =>
                              toast.success('Inzending successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Inzending kon niet worden verwijderd')
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
