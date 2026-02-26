import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/ui/page-layout';
import { searchTable, sortTable } from '@/components/ui/sortTable';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProjectTags({ preset }: { preset?: string }) {
  const router = useRouter();
  const { project } = router.query;
  const isGlobal = !!preset && preset === 'global';

  const { data, isLoading, removeTag } = useTags(
    isGlobal ? '0' : (project as string),
    isGlobal
  );

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    let loadedTags = (data || []) as {
      id: number;
      name: string;
      type?: string;
    }[];

    const filterStartData = loadedTags?.sort((a, b) => {
      const aType = a.type ?? '';
      const bType = b.type ?? '';

      if (aType < bType) return -1;
      if (aType > bType) return 1;

      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;

      return 0;
    });

    setFilterData(filterStartData);
  }, [data]);

  const returnContent = (
    <div className="container py-6">
      <div className={`${isGlobal ? 'justify-between' : 'float-right'} flex`}>
        {isGlobal && (
          <Link
            href={`/settings/globaltags/create`}
            className="flex float-left w-fit">
            <Button variant="default">
              <Plus size="20" className="hidden lg:flex" />
              Tag toevoegen
            </Button>
          </Link>
        )}

        <div className={`mb-4 flex gap-4`}>
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
              debouncedSearchTable(e.target.value, filterData, data)
            }
          />
        </div>
      </div>

      <div className="p-6 bg-white rounded-md clear-right">
        <div className="grid grid-cols-1 lg:grid-cols-7 items-center py-2 px-2 border-b border-border">
          <ListHeading className="hidden lg:flex truncate">
            <button
              className="filter-button"
              onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
              ID
            </button>
          </ListHeading>
          <ListHeading className="hidden lg:flex truncate">
            <button
              className="filter-button"
              onClick={(e) => setFilterData(sortTable('seqnr', e, filterData))}>
              Volgorde
            </button>
          </ListHeading>
          <ListHeading className="flex truncate">
            <button
              className="filter-button"
              onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
              Naam
            </button>
          </ListHeading>
          <ListHeading className="hidden lg:flex truncate">
            <button
              className="filter-button"
              onClick={(e) => setFilterData(sortTable('type', e, filterData))}>
              Type
            </button>
          </ListHeading>
          <ListHeading className="hidden lg:flex truncate">
            <button
              className="filter-button"
              onClick={(e) =>
                setFilterData(sortTable('addToNewResources', e, filterData))
              }>
              Voeg toe aan nieuwe resources
            </button>
          </ListHeading>
        </div>
        <ul className="admin-overview">
          {filterData?.map((tag: any) => (
            <Link
              href={
                isGlobal
                  ? `/settings/globaltags/${tag?.id}`
                  : `/projects/${project}/tags/${tag.id}`
              }
              key={tag.id}>
              <li
                key={tag.id}
                className="grid grid-cols-2 lg:grid-cols-7 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                <Paragraph className="my-auto -mr-16 lg:mr-0">
                  {tag.id || null}
                </Paragraph>
                <Paragraph className="hidden lg:flex truncate my-auto">
                  {tag.seqnr || null}
                </Paragraph>
                <Paragraph className="hidden lg:flex truncate my-auto">
                  {tag.name || null}
                </Paragraph>
                <Paragraph className="hidden lg:flex truncate my-auto">
                  {tag.type}
                </Paragraph>
                <Paragraph className="hidden lg:flex truncate my-auto">
                  {tag.addToNewResources ? 'Ja' : 'Nee'}
                </Paragraph>
                <div
                  className="hidden lg:flex ml-auto"
                  onClick={(e) => e.preventDefault()}>
                  <RemoveResourceDialog
                    header="Tag verwijderen"
                    message="Weet je zeker dat je deze tag wilt verwijderen?"
                    onDeleteAccepted={() =>
                      removeTag(tag.id)
                        .then(() => toast.success('Tag successvol verwijderd'))
                        .catch((e) =>
                          toast.error('Tag kon niet worden verwijderd')
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
  );

  return isGlobal ? (
    returnContent
  ) : (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Tags',
            url: `/projects/${project}/tags`,
          },
        ]}
        action={
          <Link
            href={`/projects/${project}/tags/create`}
            className="flex w-fit">
            <Button variant="default">
              <Plus size="20" className="hidden lg:flex" />
              Tag toevoegen
            </Button>
          </Link>
        }>
        {returnContent}
      </PageLayout>
    </div>
  );
}
