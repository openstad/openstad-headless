import { PageLayout } from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';

export default function ProjectTags() {
  const router = useRouter();
  const { project } = router.query;

  const { data, isLoading, removeTag } = useTags(project as string);


  const [filterData, setFilterData] = useState([]);

  useEffect(() => {
    setFilterData(data);
    console.log(data)
  }, [data])

  if (!data) return null;

  const sortFunctions = {
    'id': (a: any, b: any) => b.id - a.id,
    'name': (a: any, b: any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    'type': (a: any, b: any) => a.type.toLowerCase().localeCompare(b.type.toLowerCase()),
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
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
          },
          {
            name: 'Tags',
            url: `/projects/${project}/tags`,
          },
        ]}
        action={
          <Link href={`/projects/${project}/tags/create`} className="flex w-fit">
            <Button variant="default">
              <Plus size="20" className="hidden lg:flex" />
              Tag toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-5 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex truncate">
                <button className="filter-button" onClick={(e) => sortTable('id', e)}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="flex truncate">
                <button className="filter-button" onClick={(e) => sortTable('name', e)}>
                  Naam
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex truncate">
                <button className="filter-button" onClick={(e) => sortTable('type', e)}>
                  Type
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((tag: any) => (
                <Link
                  href={`/projects/${project}/tags/${tag.id}`}
                  key={tag.id}>
                  <li key={tag.id} className="grid grid-cols-2 lg:grid-cols-5 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="my-auto -mr-16 lg:mr-0">{tag.id || null}</Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">{tag.name || null}</Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">{tag.type}</Paragraph>
                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Tag verwijderen"
                        message="Weet je zeker dat je deze tag wilt verwijderen?"
                        onDeleteAccepted={() =>
                          removeTag(tag.id)
                            .then(() =>
                              toast.success('Tag successvol verwijderd')
                            )
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
      </PageLayout>
    </div>
  )
}
