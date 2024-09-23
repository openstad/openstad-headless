import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React from 'react';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { useRouter } from 'next/router';
import { sortTable, searchTable } from '@/components/ui/sortTable';
import projectListSwr from '../../hooks/use-project-list';

export default function Projects() {
  const { data, isLoading, error } = projectListSwr();
  const router = useRouter();

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  useEffect(() => {
    setFilterData(data);
  }, [data])

  if (!data) return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
        ]}
        action={
          <Link href="/projects/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Project toevoegen
            </Button>
          </Link>
        }>
      </PageLayout>
    </div>
  );


  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
        ]}
        action={
          <Link href="/projects/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Project toevoegen
            </Button>
          </Link>
        }>

        <div className="container py-6">

          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}
            >
              <option value="">Alles</option>
              <option value="name">Projectnaam</option>
              <option value="issues">Issues</option>
              <option value="config.votes.isActive">Stemmen</option>
              <option value="config.comments.canComment">Gestemd op nee</option>
              <option value="config.project.endDate">Eind datum</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-2 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('name', e, filterData))}>
                  Projectnaam
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('issues', e, filterData))}>
                  Problemen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('votesIsActive', e, filterData))}>
                  Stemmen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('commentsIsActive', e, filterData))}>
                  Reacties
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('resources', e, filterData))}>
                  Inzendingen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('endDate', e, filterData))}>
                  Einddatum
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('url', e, filterData))}>
                  url
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((project: any) => {
                return (
                  <li
                    className="grid grid-cols-2 lg:grid-cols-8 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2"
                    key={project.id}
                    onClick={(d) => {
                      router.push(`${router.asPath}/${project.id}/widgets`);
                    }}>
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      Geen
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {project?.config?.votes?.isActive === true ? 'Aan' : 'Uit'}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {project?.config?.comments?.canComment === true ? 'Aan' : 'Uit'}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      Open
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate -mr-16">
                      {project?.config?.project?.endDate ? new Date(project.config.project.endDate).toLocaleDateString('nl-NL') : ''}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {project.url}
                    </Paragraph>
                    <Paragraph className="flex">
                      <ChevronRight
                        strokeWidth={1.5}
                        className="w-5 h-5 my-auto ml-auto"
                      />
                    </Paragraph>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
