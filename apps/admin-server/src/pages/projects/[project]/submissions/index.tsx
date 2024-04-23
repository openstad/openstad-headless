import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { toast } from 'react-hot-toast';
import { sortTable, searchTable } from '@/components/ui/sortTable';
import useSubmissions from "@/hooks/use-submission";
import useUsers from "@/hooks/use-users";
import {useWidgetsHook} from "@/hooks/use-widgets";
import {exportDataToCSV} from "@/lib/export-helpers/csv-export";
import {Select, SelectTrigger, SelectContent, SelectValue, SelectItem} from "@/components/ui/select";

export default function ProjectSubmissions() {
  const router = useRouter();
  const { project } = router.query;
  const { data, remove } = useSubmissions(project as string);

  const [filterData, setFilterData] = useState(data);
  const debouncedSearchTable = searchTable(setFilterData);
  const [activeWidget, setActiveWidget] = useState("0");
  const [allWidgets, setAllWidgets] = useState([]);

  useEffect(() => {
    let loadedTags = (data || []) as { createdAt: string }[];

    const sortedData = loadedTags.sort((a, b) => {
      const timestampA = Date.parse(a.createdAt);
      const timestampB = Date.parse(b.createdAt);
      return timestampB - timestampA;
    });

    setFilterData(sortedData);
  }, [data]);

  const { data: usersData } = useUsers();
  const { data: widgetData } = useWidgetsHook(
    project as string
  );

  useEffect(() => {
    if (!!data && !!widgetData) {
      let widgets = [];

      data.forEach((submission: any) => {
        const widgetId = submission.widgetId;
        const usedWidget = widgetData.find((widget) => widget.id === widgetId);

        if (usedWidget && !widgets.some((widget) => widget.id === usedWidget.id)) {
          widgets.push({
            id: usedWidget.id,
            name: usedWidget.description
          });
        }
      });

      setAllWidgets(widgets);
    }
  }, [data, widgetData]);

  const selectClick = (value) => {
    const ID = value !== "0" ? value?.split(" - ")[0] : "0";
    const filteredData = ID === "0" ? data : data?.filter((submission) => (submission.widgetId).toString() === ID);

    setFilterData(filteredData);
    setActiveWidget(value);
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
              className="w-auto"
            >
                <SelectTrigger
                  className="w-auto"
                >
                  <SelectValue placeholder="Filter inzendingen op widget" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Filter inzendingen op widget</SelectItem>
                {allWidgets?.map((widget) => (
                  <SelectItem key={widget.id} value={`${widget.id} - ${widget.name}`}>{`${widget.id} - ${widget.name}`}</SelectItem>
                ))}

              </SelectContent>
            </Select>

            <Button
              className="text-xs p-2"
              type="submit"
              onClick={() => exportDataToCSV(filterData, 'submissions', activeWidget)}
              disabled={activeWidget === "0"}
            >
              Exporteer inzendingen .csv
            </Button>
          </div>
        }>
        <div className="container py-6">

        <input
            type="text"
            className='mb-4 p-2 rounded float-right'
            placeholder="Zoeken..."
            onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
          />

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
                const user = usersData?.find((user) => user.id === userId) || null;
                const currentUserKey = !!user && user.idpUser?.identifier && user.idpUser?.provider ? `${user.idpUser.provider}-*-${user.idpUser.identifier}` : ( user?.id?.toString() || 'unknown' );

                const widgetId = submission.widgetId;
                const usedWidget = widgetData?.find((widget) => widget.id === widgetId) || null;
                const widgetName = usedWidget ? usedWidget.description : null;

                return (
                  <li
                    key={submission.id}
                    className="grid grid-cols-2 lg:grid-cols-5 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                    style={{gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr"}}
                  >
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      <a
                        style={{textDecoration: 'underline'}}
                         onClick={(e) => {
                           e.preventDefault();
                           router.push(`/projects/${project}/widgets/${widgetType}/${submission.widgetId}`);
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
                        header="Resource verwijderen"
                        message="Weet je zeker dat je deze inzending wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(submission.id)
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
