import { PageLayout } from '../../../../components/ui/page-layout';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { ExportSettingsDialog, ExportSettings } from '@/components/dialog-export-settings';
import { toast } from 'react-hot-toast';
import { sortTable, searchTable } from '@/components/ui/sortTable';
import useSubmissions from "@/hooks/use-submission";
import useUsers from "@/hooks/use-users";
import {useWidgetsHook} from "@/hooks/use-widgets";
import {exportSubmissionsToCSV} from "@/lib/export-helpers/submissions-export";
import {Select, SelectTrigger, SelectContent, SelectValue, SelectItem} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmActionDialog } from '@/components/dialog-confirm-action';

export default function ProjectSubmissions() {
  const router = useRouter();
  const { project } = router.query;
  const { data, remove } = useSubmissions(project as string);

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [activeWidget, setActiveWidget] = useState("0");
  const [allWidgets, setAllWidgets] = useState<{ id: number; name: string }[]>([]);

  const [selectedWidget, setSelectedWidget] = useState<any>(null);

  const totalCount = data?.length || 0;

  useEffect(() => {
    let loadedSubmissions = (data || []) as { createdAt: string }[];

    const sortedData = loadedSubmissions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

    setFilterData(sortedData);
  }, [data]);

  const { data: usersData } = useUsers();
  const { data: widgetData } = useWidgetsHook(
    project as string
  );

  useEffect(() => {
    if (!!data && !!widgetData) {
      let widgets: { id: number; name: string }[] = [];

      data.forEach((submission: any) => {
        const widgetId = submission.widgetId;
        const usedWidget = widgetData.find((widget: any) => widget.id === widgetId);

        if (usedWidget && !widgets.some((widget: any) => widget.id === usedWidget.id)) {
          widgets.push({
            id: usedWidget.id,
            name: usedWidget.description
          });
        }
      });

      setAllWidgets(widgets);
    }
  }, [data, widgetData]);

  const selectClick = (value: any) => {
    const ID = value !== "0" ? value?.split(" - ")[0] : "0";
    const filteredData = ID === "0" ? data : data?.filter((submission: any) => (submission.widgetId || 0).toString() === ID);

    setFilterData(filteredData);
    setActiveWidget(value);

    const selectedWidget = widgetData.find((widget: any) => widget.id.toString() === ID);
    setSelectedWidget(selectedWidget);
  }

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Formulier inzendingen"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Inzendingen',
            url: `/projects/${project}/submissions`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto gap-4'>
            <Select
              value={activeWidget}
              onValueChange={selectClick}
            >
                <SelectTrigger
                  className="w-auto"
                >
                  <SelectValue placeholder="Filter inzendingen op widget" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Filter inzendingen op widget</SelectItem>
                {allWidgets?.map((widget: any) => (
                  <SelectItem key={widget.id} value={`${widget.id} - ${widget.name}`}>{`${widget.id} - ${widget.name}`}</SelectItem>
                ))}

              </SelectContent>
            </Select>

            <ExportSettingsDialog
              disabled={activeWidget === "0"}
              onExport={(settings: ExportSettings) =>
                exportSubmissionsToCSV(filterData, activeWidget, selectedWidget, settings)
              }
            />
          </div>
        }>
        <div className="container py-6">
          <div className="mb-2">
            <span className="text-sm text-gray-500">
              {selectedItems.length > 0
                ? `${selectedItems.length} van ${totalCount} ${totalCount === 1 ? 'inzending' : 'inzendingen'} geselecteerd`
                : `${totalCount} ${totalCount === 1 ? 'inzending' : 'inzendingen'}`}
            </span>
          </div>
          <div className="flex justify-between mb-4 gap-4">
            <div className="flex gap-4">
              <Button
                variant={'destructive'}
                className="flex items-center gap-2"
                onClick={(e) => e.preventDefault()}
                disabled={selectedItems.length === 0}
              >
                <ConfirmActionDialog
                  buttonText="Verwijderen"
                  header="Inzendingen verwijderen"
                  message="Weet je zeker dat je de geselecteerde inzendingen wilt verwijderen?"
                  confirmButtonText="Verwijderen"
                  cancelButtonText="Annuleren"
                  onConfirmAccepted={() => {
                    remove(0, true, selectedItems)
                      .then(() => {
                        toast.success('Inzendingen succesvol verwijderd');
                        setSelectedItems([]);
                      })
                      .catch(() =>
                        toast.error('Inzendingen konden niet worden verwijderd')
                      )
                  }}
                  confirmButtonVariant="destructive"
                />
              </Button>
            </div>
            <div className="flex gap-4">
              <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
              <select
                className="p-2 rounded"
                onChange={(e) => setFilterSearchType(e.target.value)}
              >
                <option value="">Alles</option>
                <option value="id">Widget ID</option>
                <option value="user">Gebruiker ID</option>
                <option value="submittedData">Ingezonden Data</option>
                <option value="createdAt">Datum aangemaakt</option>
              </select>
              <input
                type="text"
                className='p-2 rounded'
                placeholder="Zoeken..."
                onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
              />
            </div>
          </div>

          <div className="p-6 bg-white rounded-md">
            <div
              className="grid grid-cols-3 lg:grid-cols-6 items-center py-2 px-2 border-b border-border"
              style={{gridTemplateColumns: "50px 1fr 1fr 2fr 1fr 1fr"}}
            >
              <Checkbox
                checked={filterData?.length > 0 && filterData.every((s: any) => selectedItems.includes(s.id))}
                onCheckedChange={(checked) => {
                  const currentPageIds = filterData?.map((s: any) => s.id) || [];
                  if (checked) {
                    setSelectedItems(prev => Array.from(new Set([...prev, ...currentPageIds])));
                  } else {
                    setSelectedItems(prev => prev.filter(id => !currentPageIds.includes(id)));
                  }
                }}
              />
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('widgetId', e, filterData))}>
                  Widget ID | Naam
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('userId', e, filterData))}>
                  Gebruiker ID
                </button>
              </ListHeading>
              <ListHeading className="hidden w-full lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('submittedData', e, filterData))}>
                  Ingezonden Data
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('createdAt', e, filterData))}>
                  Datum aangemaakt
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
            </div>
            <ul>
              {filterData?.map((submission: any) => {
                const userId = submission.userId;
                const user = usersData?.find((user: any) => user.id === userId) || null;
                const currentUserKey = !!user && user.idpUser?.identifier && user.idpUser?.provider ? `${user.idpUser.provider}-*-${user.idpUser.identifier}` : ( user?.id?.toString() || 'unknown' );

                const widgetId = submission.widgetId;
                const usedWidget = widgetData?.find((widget: any) => widget.id === widgetId) || null;
                const widgetName = usedWidget ? usedWidget.description : null;
                const widgetType = usedWidget ? usedWidget.type : null;

                return (
                  <li
                    key={submission.id}
                    className="grid grid-cols-3 lg:grid-cols-6 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                    style={{gridTemplateColumns: "50px 1fr 1fr 2fr 1fr 1fr"}}
                  >
                    <Checkbox
                      className="my-auto"
                      checked={selectedItems.includes(submission.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(prev => [...prev, submission.id]);
                        } else {
                          setSelectedItems(prev => prev.filter(id => id !== submission.id));
                        }
                      }}
                    />
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      <a
                        style={{textDecoration: 'underline'}}
                         onClick={(e) => {
                           e.preventDefault();
                           router.push(`/projects/${project}/submissions/${submission.widgetId}?dataId=${submission.id}`);
                         }}
                      >
                        {submission.widgetId} | {widgetName}
                      </a>
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      <a
                        style={{textDecoration: 'underline'}}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/users/${btoa(currentUserKey)}`);
                        }}
                      >
                        {submission.userId}
                      </a>
                    </Paragraph>
                    <Paragraph
                      className="hidden lg:flex truncate my-auto"
                      style={{marginRight: '1rem'}}
                    >
                      {JSON.stringify(submission.submittedData)}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                      {submission.createdAt}
                    </Paragraph>

                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Inzending verwijderen"
                        message="Weet je zeker dat je deze inzending wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(submission.id)
                            .then(() =>
                              toast.success('Inzending succesvol verwijderd')
                            )
                            .catch(() =>
                              toast.error('Inzending kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
