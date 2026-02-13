import { ConfirmActionDialog } from '@/components/dialog-confirm-action';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchTable, sortTable } from '@/components/ui/sortTable';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useChoiceGuideResults from '@/hooks/use-choiceguide-results';
import useUsers from '@/hooks/use-users';
import { useWidgetsHook } from '@/hooks/use-widgets';
import { exportChoiceGuideToCSV } from '@/lib/export-helpers/choiceguide-export';
import { Paginator } from '@openstad-headless/ui/src';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '../../../../components/ui/button';
import { PageLayout } from '../../../../components/ui/page-layout';

export default function ProjectChoiceGuideResults() {
  const router = useRouter();
  const { project } = router.query;

  const [selectedWidget, setSelectedWidget] = useState<any>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageLimit = 100;
  const [filterData, setFilterData] = useState<
    { createdAt: string; id?: string }[]
  >([]);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [activeWidget, setActiveWidget] = useState('0');
  const [allWidgets, setAllWidgets] = useState<{ id: number; name: string }[]>(
    []
  );

  const { remove } = useChoiceGuideResults(project as string);

  const { data: usersData } = useUsers();
  const { data: widgetData } = useWidgetsHook(project as string);

  const [totalCount, setTotalCount] = useState(0);

  const fetchResults = async () => {
    try {
      const projectNumber = parseInt(project as string);

      if (isNaN(projectNumber) || isNaN(page) || isNaN(pageLimit)) {
        toast.error('Invalid project');
        return;
      }

      let url = `/api/openstad/api/project/${projectNumber}/choicesguide?page=${page}&limit=${pageLimit}`;

      if (selectedWidget?.id && selectedWidget?.id !== '0') {
        url += `&widgetId=${selectedWidget?.id}`;
      }

      const response = await fetch(url);
      return response.json();
    } catch (error) {}
  };

  const handleDelete = async (id: string | number) => {
    try {
      await remove(id);

      setFilterData((prevData) => prevData.filter((item) => item.id !== id));
      setTotalCount((prev) => prev - 1);

      toast.success('Resultaat succesvol verwijderd');
    } catch (error) {
      toast.error('Resultaat kon niet worden verwijderd');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await remove(0, true, selectedItems);
      setFilterData((prevData) =>
        prevData.filter((item) => !selectedItems.includes(Number(item.id)))
      );
      setTotalCount((prev) => prev - selectedItems.length);
      toast.success('Resultaten succesvol verwijderd');
      setSelectedItems([]);
    } catch (error) {
      toast.error('Resultaten konden niet worden verwijderd');
    }
  };

  useEffect(() => {
    fetchResults().then((results) => {
      if (results) {
        const data = results?.data || [];
        const totalCount = results?.pagination?.totalCount || 50;

        const pageCount = Math.ceil(totalCount / pageLimit);
        setTotalPages(pageCount);

        let loadedChoiceGuideResults = (data || []) as { createdAt: string }[];
        const sortedData = loadedChoiceGuideResults.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
        );

        setTotalCount(totalCount);
        setFilterData(sortedData);
      }
    });
  }, [page, selectedWidget, project]);

  useEffect(() => {
    if (!!widgetData) {
      let widgets: { id: number; name: string }[] = [];

      widgetData.forEach((widget: any) => {
        if (widget?.type === 'choiceguide') {
          widgets.push({
            id: widget?.id,
            name: widget?.description,
          });
        }
      });

      setAllWidgets(widgets);
    }
  }, [widgetData]);

  const selectClick = (value: any) => {
    const ID = value !== '0' ? value?.split(' - ')[0] : '0';

    setActiveWidget(value);

    const selectedWidget = widgetData.find(
      (widget: any) => widget.id.toString() === ID
    );
    setSelectedWidget(selectedWidget);
  };

  return (
    <>
      <style jsx global>{`
        .osc-paginator {
          justify-content: center;
          margin-top: 30px;
        }
        .osc-paginator .osc-icon-button .icon p {
          display: none;
        }
      `}</style>

      <div>
        <PageLayout
          pageHeader="Keuzewijzer inzendingen"
          breadcrumbs={[
            {
              name: 'Projecten',
              url: '/projects',
            },
            {
              name: 'Inzendingen',
              url: `/projects/${project}/choiceguide-results`,
            },
          ]}
          action={
            <div className="flex flex-row w-full md:w-auto my-auto gap-4">
              <Select value={activeWidget} onValueChange={selectClick}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Filter inzendingen op widget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    Filter inzendingen op widget
                  </SelectItem>
                  {allWidgets?.map((widget: any) => (
                    <SelectItem
                      key={widget.id}
                      value={`${widget.id} - ${widget.name}`}>{`${widget.id} - ${widget.name}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="text-xs p-2"
                type="submit"
                onClick={() =>
                  exportChoiceGuideToCSV(
                    activeWidget,
                    selectedWidget,
                    project as string,
                    totalCount + 1
                  )
                }
                disabled={activeWidget === '0'}>
                Exporteer inzendingen
              </Button>
            </div>
          }>
          <div className="container py-6">
            <div className="mb-2">
              <span className="text-sm text-gray-500">
                {selectedItems.length > 0
                  ? `${selectedItems.length} van ${totalCount} ${totalCount === 1 ? 'resultaat' : 'resultaten'} geselecteerd`
                  : `${totalCount} ${totalCount === 1 ? 'resultaat' : 'resultaten'}`}
              </span>
            </div>
            <div className="flex justify-between mb-4 gap-4">
              <div className="flex gap-4">
                <Button
                  variant={'destructive'}
                  className="flex items-center gap-2"
                  onClick={(e) => e.preventDefault()}
                  disabled={selectedItems.length === 0}>
                  <ConfirmActionDialog
                    buttonText="Verwijderen"
                    header="Resultaten verwijderen"
                    message="Weet je zeker dat je de geselecteerde resultaten wilt verwijderen?"
                    confirmButtonText="Verwijderen"
                    cancelButtonText="Annuleren"
                    onConfirmAccepted={handleBulkDelete}
                    confirmButtonVariant="destructive"
                  />
                </Button>
              </div>
              <div className="flex gap-4">
                <p className="text-xs font-medium text-muted-foreground self-center">
                  Filter op:
                </p>
                <select
                  className="p-2 rounded"
                  onChange={(e) => setFilterSearchType(e.target.value)}>
                  <option value="">Alles</option>
                  <option value="id">Widget ID</option>
                  <option value="user">Gebruiker ID</option>
                  <option value="result">Ingezonden Data</option>
                  <option value="createdAt">Datum aangemaakt</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-white rounded-md">
              <div
                className="grid grid-cols-3 lg:grid-cols-6 items-center py-2 px-2 border-b border-border"
                style={{ gridTemplateColumns: '50px 1fr 1fr 2fr 1fr 1fr' }}>
                <Checkbox
                  checked={
                    filterData?.length > 0 &&
                    filterData.every((r: any) => selectedItems.includes(r.id))
                  }
                  onCheckedChange={(checked) => {
                    const currentPageIds =
                      filterData?.map((r: any) => r.id) || [];
                    if (checked) {
                      setSelectedItems((prev) =>
                        Array.from(new Set([...prev, ...currentPageIds]))
                      );
                    } else {
                      setSelectedItems((prev) =>
                        prev.filter((id) => !currentPageIds.includes(id))
                      );
                    }
                  }}
                />
                <ListHeading className="hidden lg:flex">
                  <button
                    className="filter-button"
                    onClick={(e) =>
                      setFilterData(sortTable('widgetId', e, filterData))
                    }>
                    Widget ID | Naam
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex">
                  <button
                    className="filter-button"
                    onClick={(e) =>
                      setFilterData(sortTable('userId', e, filterData))
                    }>
                    Gebruiker ID
                  </button>
                </ListHeading>
                <ListHeading className="hidden w-full lg:flex lg:col-span-1">
                  <button
                    className="filter-button"
                    onClick={(e) =>
                      setFilterData(sortTable('result', e, filterData))
                    }>
                    Ingezonden Data
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1">
                  <button
                    className="filter-button"
                    onClick={(e) =>
                      setFilterData(sortTable('createdAt', e, filterData))
                    }>
                    Datum aangemaakt
                  </button>
                </ListHeading>
                <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
              </div>
              <ul>
                {filterData?.map((choiceguideResult: any) => {
                  const userId = choiceguideResult.userId;
                  const user =
                    usersData?.find((user: any) => user.id === userId) || null;
                  const currentUserKey =
                    !!user && user.idpUser?.identifier && user.idpUser?.provider
                      ? `${user.idpUser.provider}-*-${user.idpUser.identifier}`
                      : user?.id?.toString() || 'unknown';

                  const widgetId = choiceguideResult.widgetId;
                  const usedWidget =
                    widgetData?.find((widget: any) => widget.id === widgetId) ||
                    null;
                  const widgetName = usedWidget ? usedWidget.description : null;
                  const widgetType = usedWidget ? usedWidget.type : null;

                  return (
                    <li
                      key={choiceguideResult.id}
                      className="grid grid-cols-3 lg:grid-cols-6 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                      style={{
                        gridTemplateColumns: '50px 1fr 1fr 2fr 1fr 1fr',
                      }}>
                      <Checkbox
                        className="my-auto"
                        checked={selectedItems.includes(choiceguideResult.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems((prev) => [
                              ...prev,
                              choiceguideResult.id,
                            ]);
                          } else {
                            setSelectedItems((prev) =>
                              prev.filter((id) => id !== choiceguideResult.id)
                            );
                          }
                        }}
                      />
                      <Paragraph className="my-auto -mr-16 lg:mr-0">
                        <a
                          style={{ textDecoration: 'underline' }}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(
                              `/projects/${project}/widgets/${widgetType}/${choiceguideResult.widgetId}`
                            );
                          }}>
                          {choiceguideResult.widgetId} | {widgetName}
                        </a>
                      </Paragraph>
                      <Paragraph className="hidden lg:flex truncate my-auto">
                        <a
                          style={{ textDecoration: 'underline' }}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/users/${btoa(currentUserKey)}`);
                          }}>
                          {choiceguideResult.userId}
                        </a>
                      </Paragraph>
                      <Paragraph
                        className="hidden lg:flex truncate my-auto"
                        style={{ marginRight: '1rem' }}>
                        {JSON.stringify(choiceguideResult.result)}
                      </Paragraph>
                      <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                        {choiceguideResult.createdAt}
                      </Paragraph>

                      <div
                        className="hidden lg:flex ml-auto"
                        onClick={(e) => e.preventDefault()}>
                        <RemoveResourceDialog
                          header="Resultaat verwijderen"
                          message="Weet je zeker dat je dit resultaat wilt verwijderen?"
                          onDeleteAccepted={() =>
                            handleDelete(choiceguideResult.id)
                          }
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              {totalPages > 0 && (
                <Paginator
                  page={page || 0}
                  totalPages={totalPages || 1}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              )}
            </div>
          </div>
        </PageLayout>
      </div>
    </>
  );
}
