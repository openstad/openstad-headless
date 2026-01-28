import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import useResources from '@/hooks/use-resources';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { toast } from 'react-hot-toast';
import { sortTable, searchTable } from '@/components/ui/sortTable';
import * as XLSX from 'xlsx';
import flattenObject from "@/lib/export-helpers/flattenObject";
import { exportToXLSX } from '@/lib/export-helpers/xlsx-export';
import {ConfirmActionDialog} from "@/components/dialog-confirm-action";
import {Checkbox} from "@/components/ui/checkbox";
import { ImportButton } from '@/components/importButton';
import { keyMap } from '@/lib/keyMap';
import { Paginator } from '@openstad-headless/ui/src';

interface ProjectResourcesProps {
  BETA_FEATURE_FLAG_BULK_IMPORT: string;
}

const prepareDataForExport = (data: any[]) => {
  const allResources: any[] = [];

  data.forEach((resource) => {
    for (const [key, values] of Object.entries(resource)) {
      if ( (key.startsWith('tags') || key.startsWith('statuses')) && Array.isArray(values)) {
        try {
          const createString = values.map((value: any) => {
            return key.startsWith('tags')
            ? `${value.name} (type: ${value.type})`
            : value.name
          }).filter(Boolean).join(' | ');

          resource[key] = createString || '';
        } catch (e) {}
      }

      if ( (key.startsWith('images') || key.startsWith('documents') ) && Array.isArray(values)) {
        try {
          const createString = values.map((value: any) => {
            return key.startsWith('images')
              ? `${value.url}${ value.description ? ` (${value.description})` : '' }`
              : `${value.url}${ value.name ? ` (${value.name})` : '' }`;
          }).filter(Boolean).join(' | ');

          resource[key] = createString || '';
        } catch (e) {}
      }
    };

    allResources.push(resource);
  });

  return allResources;
}

export async function getServerSideProps() {
  return {
    props: {
      BETA_FEATURE_FLAG_BULK_IMPORT: process.env.BETA_FEATURE_FLAG_BULK_IMPORT,
    },
  };
}

export default function ProjectResources({ BETA_FEATURE_FLAG_BULK_IMPORT }: ProjectResourcesProps) {
  const router = useRouter();
  const { project } = router.query;

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const { data, pagination, error, isLoading, remove, duplicate, fetchAll } = useResources(
    project as string,
    false,
    page,
    pageLimit
  );

  async function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');

    const allData = await fetchAll(totalCount, pageLimit);
    const preparedData = prepareDataForExport(allData);

    exportToXLSX(preparedData, `${projectId}_resources_${formattedDate}.xlsx`, keyMap);
  }

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);
  const [bulkSelectActive, setBulkSelectActive] = useState<boolean>(false);
  const [selectedWidgets, setSelectedWidgets] = useState<number[]>([]);

  useEffect(() => {
    if (pagination) {
      const count = pagination.totalCount || 0;
      const pageCount = Math.ceil(count / pageLimit);
      setTotalPages(pageCount);
      setTotalCount(count);
    }
    setFilterData(data);
  }, [data, pagination, pageLimit])

  if (!data) return null;

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
        pageHeader="Inzendingen"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Inzendingen',
            url: `/projects/${project}/resources`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto gap-4'>
            <Link
              href={`/projects/${project}/resources/create`}>
              <Button variant="default" className='text-xs p-2 w-fit'>
                <Plus size="20" className="hidden lg:flex" />
                Inzending toevoegen
              </Button>
            </Link>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer inzendingen
            </Button>
            {BETA_FEATURE_FLAG_BULK_IMPORT === "true" && <ImportButton project={project as string} />}
          </div>
        }>
        <div className="container py-6"><div className="float-left mb-4 flex gap-4">
          <Button
            variant={'outline'}
            className="flex items-center gap-2 float-left"
            onClick={() => {
              setSelectedWidgets([])
              setBulkSelectActive(!bulkSelectActive)
            }}
          >
            {bulkSelectActive ? 'Bulk selecteren stoppen' : 'Bulk selecteren'}
          </Button>

          {bulkSelectActive && (
            <>
              <Button
                variant={'default'}
                className="flex items-center gap-2 float-left"
                onClick={(e) => e.preventDefault()}
                disabled={ selectedWidgets.length === 0 }
              >
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
                        toast.error('Widgets konden (gedeeltelijk) niet worden gedupliceerd')
                      )
                  }}
                  confirmButtonVariant="default"
                />
              </Button>
              <Button
                variant={'destructive'}
                className="flex items-center gap-2 float-left"
                onClick={(e) => e.preventDefault()}
                disabled={ selectedWidgets.length === 0 }
              >
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
                        toast.error('Widgets konden (gedeeltelijk) niet worden verwijderd')
                      )
                  }}
                  confirmButtonVariant="destructive"
                />
              </Button>
            </>
          )}
        </div>

          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">Filter op:</p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}
            >
              <option value="">Alles</option>
              <option value="id">Stem ID</option>
              <option value="title">Inzendingen</option>
              <option value="yes">Gestemd op ja</option>
              <option value="no">Gestemd op nee</option>
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
              className="grid grid-cols-2 items-center py-2 px-2 border-b border-border"
              style={{ gridTemplateColumns: `repeat(${bulkSelectActive ? 2 : 1}, 50px) 3fr repeat(5, 1fr) 60px` }}
            >
              {bulkSelectActive && (<ListHeading />)}
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('resource', e, filterData))}>
                  Inzendingen
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('voted-yes', e, filterData))}>
                  Gestemd op ja
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('voted-no', e, filterData))}>
                  Gestemd op nee
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('score', e, filterData))}>
                  Wilson score interval
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('date-added', e, filterData))}>
                  Datum aangemaakt
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1 ml-auto"></ListHeading>
            </div>
            <ul>
              {filterData?.map((resource: any) => (
                <Link
                  key={resource.id}
                  href={ bulkSelectActive ? `/projects/${project}/resources/` : `/projects/${project}/resources/${resource.id}`}
                  scroll={ !bulkSelectActive }
                >
                  <li
                    className="grid grid-cols-2 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b"
                    style={{ gridTemplateColumns: `repeat(${bulkSelectActive ? 2 : 1}, 50px) 3fr repeat(5, 1fr) 60px` }}
                  >
                    {bulkSelectActive && (
                      <Checkbox
                        className="my-auto"
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedWidgets((prev) => [...prev, resource.id]);
                          } else {
                            setSelectedWidgets((prev) => prev.filter(id => id !== resource.id));
                          }
                        }}
                      />
                    )}
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      {resource.id}
                    </Paragraph>
                    <Paragraph className="my-auto -mr-16 lg:mr-0">
                      {resource.title}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      {resource.yes || 0}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      {resource.no || 0}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto">
                      {resource.score || 0}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate my-auto lg:-mr-16">
                      {resource.createDateHumanized}
                    </Paragraph>

                    <div
                      className="hidden lg:flex ml-auto"
                      onClick={(e) => e.preventDefault()}>
                      <RemoveResourceDialog
                        header="Inzending verwijderen"
                        message="Weet je zeker dat je deze inzending wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(resource.id)
                            .then(() =>
                              toast.success('Inzending successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Inzending kon niet worden verwijderd')
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

            {totalPages > 0 && (
              <div className="flex flex-col items-center gap-4 mt-4">
                <Paginator
                  page={page || 0}
                  totalPages={totalPages || 1}
                  onPageChange={(newPage) => setPage(newPage)}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rijen per pagina:</span>
                  <select
                    className="p-2 rounded border"
                    value={pageLimit}
                    onChange={(e) => {
                      setPageLimit(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                  </select>
                  <span className="text-sm text-gray-500">
                    ({totalCount} totaal)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
      </div>
    </>
  );
}
