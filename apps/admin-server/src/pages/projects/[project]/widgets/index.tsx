import { SessionContext } from '@/auth';
import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { RenameResourceDialog } from '@/components/dialog-resource-rename';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PageLayout } from '@/components/ui/page-layout';
import { searchTable, sortTable } from '@/components/ui/sortTable';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { Widget, useWidgetsHook } from '@/hooks/use-widgets';
import { HasAccess } from '@/lib/hasAccess';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProjectWidgets() {
  const router = useRouter();
  const { project } = router.query;

  const {
    data: widgets,
    isLoading: isLoadingWidgets,
    remove,
    duplicate,
  } = useWidgetsHook(project as string);

  const [data, setData] = useState(widgets);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setData, filterSearchType);
  const [bulkSelectActive, setBulkSelectActive] = useState<boolean>(false);
  const [selectedWidgets, setSelectedWidgets] = useState<number[]>([]);

  useEffect(() => {
    if (widgets) {
      setData(widgets);
    }
  }, [widgets]);

  const sessionData = useContext(SessionContext);

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
          <div className="float-left mb-4 flex gap-4">
            <Button
              variant={'outline'}
              className="flex items-center gap-2 float-left"
              onClick={() => {
                setSelectedWidgets([]);
                setBulkSelectActive(!bulkSelectActive);
              }}>
              {bulkSelectActive ? 'Bulk selecteren stoppen' : 'Bulk selecteren'}
            </Button>

            {bulkSelectActive && (
              <>
                <Button
                  variant={'default'}
                  className="flex items-center gap-2 float-left"
                  onClick={(e) => e.preventDefault()}
                  disabled={selectedWidgets.length === 0}>
                  <ConfirmActionDialog
                    buttonText="Dupliceren"
                    header="Widgets Dupliceren"
                    message="Weet je zeker dat je de geselecteerde widgets wilt dupliceren?"
                    confirmButtonText="Dupliceren"
                    cancelButtonText="Annuleren"
                    onConfirmAccepted={() => {
                      duplicate(selectedWidgets)
                        .then(() => {
                          toast.success('Widgets successvol gedupliceerd');
                          setSelectedWidgets([]);
                          setBulkSelectActive(false);
                        })
                        .catch((e) =>
                          toast.error(
                            'Widgets konden (gedeeltelijk) niet worden gedupliceerd'
                          )
                        );
                    }}
                    confirmButtonVariant="default"
                  />
                </Button>
                <Button
                  variant={'destructive'}
                  className="flex items-center gap-2 float-left"
                  onClick={(e) => e.preventDefault()}
                  disabled={selectedWidgets.length === 0}>
                  <ConfirmActionDialog
                    buttonText="Verwijderen"
                    header="Widgets Verwijderen"
                    message="Weet je zeker dat je de geselecteerde widgets wilt verwijderen?"
                    confirmButtonText="Verwijderen"
                    cancelButtonText="Annuleren"
                    onConfirmAccepted={() => {
                      remove(0, true, selectedWidgets)
                        .then(() => {
                          toast.success('Widgets successvol verwijderd');
                          setSelectedWidgets([]);
                          setBulkSelectActive(false);
                        })
                        .catch((e) =>
                          toast.error(
                            'Widgets konden (gedeeltelijk) niet worden verwijderd'
                          )
                        );
                    }}
                    confirmButtonVariant="destructive"
                  />
                </Button>
              </>
            )}
          </div>

          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">
              Filter op:
            </p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}>
              <option value="">Alles</option>
              <option value="id">ID</option>
              <option value="type">Widget</option>
              <option value="createdAt">Toegevoegd op</option>
              <option value="updatedAt">Gewijzigd op</option>
            </select>

            <input
              type="text"
              className="p-2 rounded"
              placeholder="Zoeken..."
              onChange={(e) =>
                debouncedSearchTable(e.target.value, data, widgets)
              }
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div
              className={`grid grid-cols-2 items-left py-2 px-2 border-b border-border`}
              style={{
                gridTemplateColumns: `repeat(${
                  bulkSelectActive ? 2 : 1
                }, 40px) repeat(5, 1fr) 60px`,
              }}>
              {bulkSelectActive && <ListHeading />}
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) => setData(sortTable('id', e, data))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) => setData(sortTable('type', e, data))}>
                  Widget
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) => setData(sortTable('date-added', e, data))}>
                  Toegevoegd op
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) => setData(sortTable('date-modified', e, data))}>
                  Gewijzigd op
                </button>
              </ListHeading>
            </div>
            <ul>
              {(data as Widget[])?.map((widget) => {
                return (
                  <Link
                    key={widget.id}
                    href={
                      bulkSelectActive
                        ? `/projects/${project}/widgets/`
                        : `/projects/${project}/widgets/${widget.type}/${widget.id}`
                    }
                    scroll={!bulkSelectActive}>
                    <li
                      className="grid grid-cols-2 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                      style={{
                        gridTemplateColumns: `repeat(${
                          bulkSelectActive ? 2 : 1
                        }, 40px) repeat(5, 1fr) 60px`,
                      }}>
                      {bulkSelectActive && (
                        <Checkbox
                          className="my-auto"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedWidgets((prev) => [
                                ...prev,
                                widget.id,
                              ]);
                            } else {
                              setSelectedWidgets((prev) =>
                                prev.filter((id) => id !== widget.id)
                              );
                            }
                          }}
                        />
                      )}

                      <Paragraph className="my-auto -mr-16 lg:mr-0">
                        {widget.id}
                      </Paragraph>
                      <div className="">
                        <strong className="">{widget.description}</strong>
                        <Paragraph className="my-auto -mr-16 lg:mr-0">
                          {WidgetDefinitions[widget.type]?.name}
                        </Paragraph>
                      </div>
                      <Paragraph className="hidden lg:flex truncate my-auto">
                        {new Date(widget.createdAt).toLocaleDateString('nl-NL')}
                      </Paragraph>
                      <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                        {new Date(widget.updatedAt).toLocaleDateString('nl-NL')}
                      </Paragraph>
                      <div></div>
                      <div className="flex">
                        <div
                          className="hidden lg:flex ml-auto"
                          onClick={(e) => e.preventDefault()}>
                          <RenameResourceDialog
                            header="Widget Bewerken"
                            widget={widget}
                          />
                        </div>

                        {HasAccess(sessionData) && (
                          <div
                            className="hidden lg:flex ml-auto"
                            onClick={(e) => e.preventDefault()}>
                            <RemoveResourceDialog
                              header="Widget verwijderen"
                              message="Weet je zeker dat je deze widget wilt verwijderen?"
                              onDeleteAccepted={() =>
                                remove(widget.id)
                                  .then(() =>
                                    toast.success(
                                      'Widget successvol verwijderd'
                                    )
                                  )
                                  .catch((e) =>
                                    toast.error(
                                      'Widget kon niet worden verwijderd'
                                    )
                                  )
                              }
                            />
                          </div>
                        )}
                      </div>
                      <Paragraph className="flex">
                        <ChevronRight
                          strokeWidth={1.5}
                          className="w-5 h-5 my-auto ml-auto"
                        />
                      </Paragraph>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
