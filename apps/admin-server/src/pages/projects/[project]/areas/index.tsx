import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { searchTable, sortTable } from '@/components/ui/sortTable';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useArea from '@/hooks/use-areas';
import useDatalayers from '@/hooks/use-datalayers';
import useMarkers from '@/hooks/use-markers';
import { ChevronRight, Copy, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '../../../../components/ui/button';
import { PageLayout } from '../../../../components/ui/page-layout';

export default function ProjectAreas() {
  const router = useRouter();
  const { project } = router.query;
  const { data: areas, removeArea } = useArea(project as string);
  const { data: datalayers, removeDatalayer } = useDatalayers(
    project as string
  );
  const {
    data: markersData,
    removeMarkers,
    duplicateMarkers,
  } = useMarkers(project as string);

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
      ...(areas?.map((area: any) => ({ ...area, type: 'Polygoon' })) || []),
      ...(datalayers?.map((layer: any) => ({ ...layer, type: 'Kaartlaag' })) ||
        []),
      ...(markersData?.map((set: any) => ({ ...set, type: 'Markers' })) || []),
    ];

    const sortedData = combinedData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setCombinedData(sortedData);
    setFilterData(sortedData);
  }, [areas, datalayers, markersData]);

  function getItemHref(item: DataItem) {
    if (item.type === 'Polygoon')
      return `/projects/${project}/areas/${item.id}`;
    if (item.type === 'Kaartlaag')
      return `/projects/${project}/areas/layers/${item.id}`;
    return `/projects/${project}/areas/markers/${item.id}`;
  }

  function handleRemove(item: DataItem) {
    if (item.type === 'Polygoon') {
      return removeArea(item.id)
        .then(() => toast.success('Polygoon succesvol verwijderd'))
        .catch(() => toast.error('Polygoon kon niet worden verwijderd'));
    }
    if (item.type === 'Kaartlaag') {
      return removeDatalayer(item.id)
        .then(() => toast.success('Kaartlaag succesvol verwijderd'))
        .catch(() => toast.error('Kaartlaag kon niet worden verwijderd'));
    }
    return removeMarkers(item.id)
      .then(() => toast.success('Markers succesvol verwijderd'))
      .catch(() => toast.error('Markers kon niet worden verwijderd'));
  }

  function handleDuplicate(item: DataItem) {
    if (item.type === 'Markers') {
      return duplicateMarkers(item.id)
        .then(() => toast.success('Markers succesvol gedupliceerd'))
        .catch(() => toast.error('Markers kon niet worden gedupliceerd'));
    }
    // TODO: duplicate for polygons and datalayers
  }

  return (
    <div>
      <PageLayout
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="flex w-fit">
                <Plus size="20" className="hidden lg:flex" />
                Toevoegen
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/projects/${project}/areas/create`)
                }>
                Polygoon
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/projects/${project}/areas/create-layer`)
                }>
                Kaartlaag
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/projects/${project}/areas/create-markers`)
                }>
                Markers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }>
        <div className="container py-6">
          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">
              Filter op:
            </p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}>
              <option value="">Alles</option>
              <option value="id">ID</option>
              <option value="name">Naam</option>
              <option value="type">Type</option>
            </select>
            <input
              type="text"
              className="p-2 rounded"
              placeholder="Zoeken..."
              onChange={(e) =>
                debouncedSearchTable(e.target.value, filterData, combinedData)
              }
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-5 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('id', e, filterData))
                  }>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('type', e, filterData))
                  }>
                  Type
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('name', e, filterData))
                  }>
                  Naam
                </button>
              </ListHeading>
            </div>

            <ul className="admin-overview">
              {filterData?.map((item: any) => (
                <Link href={getItemHref(item)} key={`${item.type}-${item.id}`}>
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
                      className="hidden lg:flex ml-auto gap-2"
                      onClick={(e) => e.preventDefault()}>
                      {item.type === 'Markers' && (
                        <button
                          className="p-1 rounded hover:bg-accent"
                          title="Dupliceren"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDuplicate(item);
                          }}>
                          <Copy size={16} strokeWidth={1.5} />
                        </button>
                      )}
                      <RemoveResourceDialog
                        header={`${item.type} verwijderen`}
                        message={`Weet je zeker dat je deze ${item.type.toLowerCase()} wilt verwijderen?`}
                        onDeleteAccepted={() => handleRemove(item)}
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
