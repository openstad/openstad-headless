import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { toast } from 'react-hot-toast';
import { sortTable, searchTable } from '@/components/ui/sortTable';
import useChoiceGuideResults from "@/hooks/use-choiceguide-results";
import useUsers from "@/hooks/use-users";
import {useWidgetsHook} from "@/hooks/use-widgets";
import {exportChoiceGuideToCSV} from "@/lib/export-helpers/choiceguide-export";
import {Select, SelectTrigger, SelectContent, SelectValue, SelectItem} from "@/components/ui/select";

export default function ProjectChoiceGuideResults() {
  const router = useRouter();
  const { project } = router.query;
  const { data, remove } = useChoiceGuideResults(project as string);

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  const [activeWidget, setActiveWidget] = useState("0");
  const [allWidgets, setAllWidgets] = useState<{ id: number; name: string }[]>([]);

  const [selectedWidget, setSelectedWidget] = useState<any>(null);

  useEffect(() => {
    let loadedChoiceGuideResults = (data || []) as { createdAt: string }[];

    const sortedData = loadedChoiceGuideResults.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

    setFilterData(sortedData);
  }, [data]);

  const { data: usersData } = useUsers();
  const { data: widgetData } = useWidgetsHook(
    project as string
  );

  useEffect(() => {
    if (!!data && !!widgetData) {
      let widgets: { id: number; name: string }[] = [];

      data.forEach((choiceguideResult: any) => {
        const widgetId = choiceguideResult.widgetId;
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
    const filteredData = ID === "0" ? data : data?.filter((choiceguideResult: any) => (choiceguideResult.widgetId).toString() === ID);

    setFilterData(filteredData);
    setActiveWidget(value);

    const selectedWidget = widgetData.find((widget: any) => widget.id.toString() === ID);
    setSelectedWidget(selectedWidget);
  }

  if (!data) return null;

  return (
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

            <Button
              className="text-xs p-2"
              type="submit"
              onClick={() => exportChoiceGuideToCSV(filterData, activeWidget, selectedWidget)}
              disabled={activeWidget === "0"}
            >
              Exporteer inzendingen .csv
            </Button>
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
              <option value="id">Widget ID</option>
              <option value="user">Gebruiker ID</option>
              <option value="result">Ingezonden Data</option>
              <option value="createdAt">Datum aangemaakt</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div
              className="grid grid-cols-2 lg:grid-cols-5 items-center py-2 px-2 border-b border-border"
              style={{gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr"}}
            >
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
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('result', e, filterData))}>
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
              {filterData?.map((choiceguideResult: any) => {
                const userId = choiceguideResult.userId;
                const user = usersData?.find((user: any) => user.id === userId) || null;
                const currentUserKey = !!user && user.idpUser?.identifier && user.idpUser?.provider ? `${user.idpUser.provider}-*-${user.idpUser.identifier}` : ( user?.id?.toString() || 'unknown' );

                const widgetId = choiceguideResult.widgetId;
                const usedWidget = widgetData?.find((widget: any) => widget.id === widgetId) || null;
                const widgetName = usedWidget ? usedWidget.description : null;
                const widgetType = usedWidget ? usedWidget.type : null;

                return (
                  <li
                    key={choiceguideResult.id}
                    className="grid grid-cols-2 lg:grid-cols-5 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                    style={{gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr"}}
                  >
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      <a
                        style={{textDecoration: 'underline'}}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/projects/${project}/widgets/${widgetType}/${choiceguideResult.widgetId}`);
                        }}
                      >
                        {choiceguideResult.widgetId} | {widgetName}
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
                        {choiceguideResult.userId}
                      </a>
                    </Paragraph>
                    <Paragraph
                      className="hidden lg:flex truncate my-auto"
                      style={{marginRight: '1rem'}}
                    >
                      {JSON.stringify(choiceguideResult.result)}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                      {choiceguideResult.createdAt}
                    </Paragraph>

                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Inzending verwijderen"
                        message="Weet je zeker dat je deze inzending wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(choiceguideResult.id)
                            .then(() =>
                              toast.success('Inzending successvol verwijderd')
                            )
                            .catch((e) =>
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
