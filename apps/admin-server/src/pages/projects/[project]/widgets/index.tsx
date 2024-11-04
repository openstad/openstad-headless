import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { RenameResourceDialog } from '@/components/dialog-resource-rename';
import { PageLayout } from '@/components/ui/page-layout';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { Widget, useWidgetsHook } from '@/hooks/use-widgets';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { sortTable, searchTable } from '@/components/ui/sortTable';
import { Button } from '@/components/ui/button';

export default function ProjectWidgets() {
  const router = useRouter();
  const { project } = router.query;


  const { data: widgets, isLoading: isLoadingWidgets, remove } = useWidgetsHook(
    project as string
  );

  const [data, setData] = useState(widgets);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setData, filterSearchType);

  useEffect(() => {
    if (widgets) {
      setData(widgets);
    }
  }, [widgets]);

  return (
    <div>
      <PageLayout
        pageHeader="Projectnaam"
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
        action={
          <Link href={`/projects/${project}/widgets/create`}>
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Widget toevoegen
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
              <option value="id">ID</option>
              <option value="type">Widget</option>
              <option value="createdAt">Toegevoegd op</option>
              <option value="updatedAt">Gewijzigd op</option>
            </select>

            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, data, widgets)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-2 lg:grid-cols-[40px_repeat(5,1fr)_60px] items-left py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setData(sortTable('id', e, data))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setData(sortTable('type', e, data))}>
                  Widget
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setData(sortTable('date-added', e, data))}>
                  Toegevoegd op
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setData(sortTable('date-modified', e, data))}>
                  Gewijzigd op
                </button>
              </ListHeading>

            </div>
            <ul>
              {(data as Widget[])?.map((widget) => {
                return (
                  <Link
                    key={widget.id}
                    href={`/projects/${project}/widgets/${widget.type}/${widget.id}`}>
                    <li className="grid grid-cols-2 lg:grid-cols-[40px_repeat(5,1fr)_60px] py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                      <Paragraph className="my-auto -mr-16 lg:mr-0">{widget.id}</Paragraph>
                      <div className="">
                        <strong className="">
                          {widget.description}
                        </strong>
                        <Paragraph className="my-auto -mr-16 lg:mr-0">{WidgetDefinitions[widget.type]?.name}</Paragraph>
                      </div>
                      <Paragraph className="hidden lg:flex truncate my-auto">
                        {new Date(widget.createdAt).toLocaleDateString("nl-NL")}
                      </Paragraph>
                      <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                        {new Date(widget.updatedAt).toLocaleDateString("nl-NL")}

                      </Paragraph>
                      <div></div>
                      <div className='flex'>
                        <div
                          className="hidden lg:flex ml-auto"
                          onClick={(e) => e.preventDefault()}>
                          <RenameResourceDialog
                            header="Widget Bewerken"
                            widget={widget}
                          />
                        </div>

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
                      </div>
                      <Paragraph className="flex">
                        <ChevronRight
                          strokeWidth={1.5}
                          className="w-5 h-5 my-auto ml-auto"
                        />
                      </Paragraph>
                    </li>
                  </Link>
                )
              })}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
