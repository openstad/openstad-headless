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
import useDatalayers from "@/hooks/use-datalayers";

export default function ProjectAreas() {
  const router = useRouter();
  const { project } = router.query;
  const { data: areas, removeArea } = useArea(project as string);
  const { data: datalayers, removeDatalayer } = useDatalayers(project as string);

  type DataItem = {
    id: number;
    name: string;
    createdAt: string;
    type: string;
    [key: string]: any;
  };

  const [filterData, setFilterData] = useState<DataItem[]>([]);
  const [combinedData, setCombinedData] = useState<DataItem[]>([]);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    const combinedData = [
      ...areas?.map((area: any) => ({ ...area, type: 'Polygoon' })) || [],
      ...datalayers?.map((layer: any) => ({ ...layer, type: 'Kaartlaag' })) || [],
    ];

    const sortedData = combinedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setCombinedData(sortedData);
    setFilterData(sortedData);
  }, [areas, datalayers]);

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
          <div className="button-container flex flex-row">
            <Link href={`/projects/${project}/areas/create-layer`} style={{marginRight: '15px'}}>
              <Button variant="default" className="flex w-fit">
                <Plus size="20" className="hidden lg:flex" />
                Kaartlaag toevoegen
              </Button>
            </Link>

            <Link href={`/projects/${project}/areas/create`}>
              <Button variant="default" className="flex w-fit">
                <Plus size="20" className="hidden lg:flex" />
                Polygoon toevoegen
              </Button>
            </Link>
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
              <option value="name">Naam</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, combinedData)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-5 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('type', e, filterData))}>
                  Type
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
                  Naam
                </button>
              </ListHeading>
            </div>

            <ul>
              {filterData?.map((item: any) => (
                  <Link
                      href={`/projects/${project}/areas/${item.type === 'Polygoon' ? item.id : `layers/${item.id}`}`}
                      key={item.id}
                  >
                    <li className="grid grid-cols-3 lg:grid-cols-5 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                      <Paragraph className="hidden lg:flex truncate">
                        {item.id}
                      </Paragraph>
                      <Paragraph className="flex truncate -mr-16">
                        {item.type}
                      </Paragraph>
                      <Paragraph className="flex truncate -mr-16">
                        {item.name}
                      </Paragraph>
                      <div
                          className="hidden lg:flex ml-auto"
                          onClick={(e) => e.preventDefault()}
                      >
                        <RemoveResourceDialog
                            header={`${item.type} verwijderen`}
                            message={`Weet je zeker dat je deze ${item.type.toLowerCase()} wilt verwijderen?`}
                            onDeleteAccepted={() =>
                                item.type === 'Polygoon'
                                    ? removeArea(item.id)
                                        .then(() => toast.success('Polygoon succesvol verwijderd'))
                                        .catch(() => toast.error('Polygoon kon niet worden verwijderd'))
                                    : removeDatalayer(item.id)
                                        .then(() => toast.success('Kaartlaag succesvol verwijderd'))
                                        .catch(() => toast.error('Kaartlaag kon niet worden verwijderd'))
                            }
                        />
                      </div>
                      <Paragraph className="flex">
                        <ChevronRight strokeWidth={1.5} className="w-5 h-5 my-auto ml-auto"/>
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
