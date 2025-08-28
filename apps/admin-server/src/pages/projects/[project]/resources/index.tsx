import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React, { use, useEffect, useState } from 'react';
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

const keyMap: Record<string, string> = {
  id: 'Inzending ID',
  projectId: 'Project ID',
  widgetId: 'Widget ID',
  title: 'Titel',
  summary: 'Samenvatting',
  description: 'Beschrijving',
  budget: 'Budget',
  'location.lat': 'Locatie (lat)',
  'location.lng': 'Locatie (lng)',
  createDateHumanized: 'Datum aangemaakt (leesbaar)',
  updatedAt: 'Laatst bijgewerkt',
  deletedAt: 'Verwijderd op',
  yes: 'Aantal likes',
  no: 'Aantal dislikes',
  progress: 'Voortgang',
  statuses: 'Statussen',
  modBreak: 'Moderatie bericht',
  modBreakDate: 'Moderatie bericht datum',
  images: 'Afbeeldingen',
  tags: 'Tags',
  documents: 'Documenten',
  'user.id': 'Gebruiker ID',
  'user.role': 'Gebruiker rol',
  'user.name': 'Gebruiker naam',
  'user.email': 'Gebruiker e-mailadres',
  'user.phonenumber': 'Gebruiker telefoonnummer',
  'user.address': 'Gebruiker adres',
  'user.city': 'Gebruiker woonplaats',
  'user.postcode': 'Gebruiker postcode',
};

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

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading, remove, duplicate } = useResources(project as string);

  function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');

    const preparedData = prepareDataForExport(data);

    exportToXLSX(preparedData, `${projectId}_resources_${formattedDate}.xlsx`, keyMap);
  }

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);
  const [bulkSelectActive, setBulkSelectActive] = useState<boolean>(false);
  const [selectedWidgets, setSelectedWidgets] = useState<number[]>([]);

  useEffect(() => {
    setFilterData(data);
  }, [data])

  if (!data) return null;

  return (
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
              style={{ gridTemplateColumns: `repeat(${bulkSelectActive ? 2 : 1}, 50px) 3fr repeat(4, 1fr) 60px` }}
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
                    style={{ gridTemplateColumns: `repeat(${bulkSelectActive ? 2 : 1}, 50px) 3fr repeat(4, 1fr) 60px` }}
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
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
