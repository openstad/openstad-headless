import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { CreateWidgetDialog } from '@/components/dialog-widget-create';
import { PageLayout } from '@/components/ui/page-layout';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { Widget, useWidgetsHook } from '@/hooks/use-widgets';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProjectWidgets() {
  const router = useRouter();
  const { project } = router.query;


  const { data: widgets, isLoading: isLoadingWidgets, remove } = useWidgetsHook(
    project as string
  );

  const [data, setData] = useState<Widget[]>(widgets);

  useEffect(() => { 
    setData(widgets);
  }, [widgets])

  const sortFunctions = {
    'date-added': (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    'date-modified': (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    'id': (a: any, b: any) => b.id - a.id,
    'type': (a: any, b: any) => b.type.toLowerCase().localeCompare(a.type.toLowerCase()),
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

    const sortedWidgets = [...widgets].sort((a: any, b: any) => {
      const result = sortFunction(a, b);
      return direction === 'up' ? result : -result;
    });

    setData(sortedWidgets);
  };


  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Widgets',
            url: `/projects/${project}/widgets`,
          },
        ]}
        action={<CreateWidgetDialog projectId={project as string} />}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-2 lg:grid-cols-[40px_repeat(5,1fr)] items-left py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => sortTable('id', e)}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => sortTable('type', e)}>
                  Widget
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => sortTable('date-added', e)}>
                  Toegevoegd op
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => sortTable('date-modified', e)}>
                  Gewijzigd op
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
            </div>
            <ul>
              {(data as Widget[])?.map((widget) => (
                <Link
                  key={widget.id}
                  href={`/projects/${project}/widgets/${widget.type}/${widget.id}`}>
                  <li className="grid grid-cols-2 lg:grid-cols-[40px_repeat(5,1fr)] py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="my-auto -mr-16 lg:mr-0">{widget.id}</Paragraph>
                    <div className="">
                      <strong className="">
                        {WidgetDefinitions[widget.type]}
                      </strong>
                      <Paragraph className="my-auto -mr-16 lg:mr-0">{widget.description}</Paragraph>
                    </div>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      {new Date(widget.createdAt).toLocaleDateString("nl-NL")}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                      {new Date(widget.updatedAt).toLocaleDateString("nl-NL")}

                    </Paragraph>
                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Widget verwijderen"
                        message="Weet je zeker dat je deze widget wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(widget.id)
                            .then(() =>
                              toast.success('Widget successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Widget kon niet worden verwijderd')
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
