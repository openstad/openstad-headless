import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { Button } from '@/components/ui/button';
import { searchTable, sortTable } from '@/components/ui/sortTable';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useUsers from '@/hooks/use-users';
import useVotes from '@/hooks/use-votes';
import { exportToXLSX } from '@/lib/export-helpers/xlsx-export';
import { Paginator } from '@openstad-headless/ui/src';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { PageLayout } from '../../../components/ui/page-layout';

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { remove } = useVotes(project as string);
  const [filterData, setFilterData] = useState<
    { createdAt: string; id?: string }[]
  >([]);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  async function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');

    const keyMap: Record<string, string> = {
      id: 'Stem ID',
      resourceId: 'Inzending ID',
      'resource.title': 'Inzending titel',
      opinion: 'Stem',
      createdAt: 'Datum',
      ip: 'IP Adres',
      userId: 'Gebruiker ID',
      'user.role': 'Gebruiker rol',
      'user.name': 'Gebruiker naam',
      'user.displayName': 'Gebruiker weergavenaam',
      'user.email': 'Gebruiker e-mailadres',
      'user.phonenumber': 'Gebruiker telefoonnummer',
      'user.address': 'Gebruiker adres',
      'user.city': 'Gebruiker woonplaats',
      'user.postcode': 'Gebruiker postcode',
    };

    await toast.promise(
      fetchAllResults().then((dataToExport) => {
        exportToXLSX(
          dataToExport,
          `${projectId}_stemmen_${formattedDate}.xlsx`,
          keyMap
        );
      }),
      {
        loading: 'Laden...',
        success: 'De stemmen zijn succesvol geëxporteerd',
        error: 'Er is een fout opgetreden bij het exporteren van de stemmen',
      }
    );
  }

  const { data: usersData } = useUsers();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageLimit = 200;
  const [totalCount, setTotalCount] = useState(0);

  const fetchResults = async (page: number) => {
    try {
      const projectNumber = parseInt(project as string);

      if (isNaN(projectNumber) || isNaN(page) || isNaN(pageLimit)) {
        return;
      }

      let url = `/api/openstad/api/project/${projectNumber}/vote?page=${page}&limit=${pageLimit}&includeResource&pageSize=${pageLimit}`;

      const response = await fetch(url);
      return response.json();
    } catch (error) {}
  };

  useEffect(() => {
    fetchResults(page).then((results) => {
      if (results) {
        const data = results?.records || [];
        const totalCount = results?.metadata?.totalCount || 50;

        const pageCount = Math.ceil(totalCount / pageLimit);
        setTotalPages(pageCount);

        let loadedVotesResults = (data || []) as { createdAt: string }[];
        const sortedData = loadedVotesResults.sort(
          (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
        );

        setTotalCount(totalCount);
        setFilterData(sortedData);
      }
    });
  }, [page, project]);

  const fetchAllResults = async () => {
    let allData: any[] = [];
    let currentPage = 0;
    let totalPages = Math.ceil(totalCount / pageLimit);
    while (currentPage < totalPages) {
      // eslint-disable-next-line no-await-in-loop
      const results = await fetchResults(currentPage);
      const data = results?.records || [];
      allData = allData.concat(data);
      currentPage += 1;
    }

    return allData;
  };

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Stemmen',
            url: `/projects/${project}/votes`,
          },
        ]}
        action={
          <div className="flex flex-row w-full md:w-auto my-auto">
            <Button
              className="text-xs p-2 w-fit"
              type="submit"
              onClick={transform}>
              Exporteer stemmen
            </Button>
          </div>
        }>
        <div className="container py-6">
          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">
              Filter op:
            </p>
            <select
              className="p-2 rounded"
              onChange={(e) => setFilterSearchType(e.target.value)}>
              <option value="">Alles</option>
              <option value="id">Stem ID</option>
              <option value="createdAt">Stemdatum</option>
              <option value="resourceId">Plan ID</option>
              <option value="userId">Gebruiker ID</option>
              <option value="ip">Gebruiker IP</option>
              <option value="opinion">Voorkeur</option>
            </select>
            {/*  --- Search werkt voor even niet ---  */}
            {/*<input*/}
            {/*  type="text"*/}
            {/*  className='p-2 rounded'*/}
            {/*  placeholder="Zoeken..."*/}
            {/*  onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}*/}
            {/*/>*/}
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('id', e, filterData))
                  }>
                  Stem ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('createdAt', e, filterData))
                  }>
                  Stemdatum
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('resourceId', e, filterData))
                  }>
                  Plan ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('userId', e, filterData))
                  }>
                  Gebruiker ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('ip', e, filterData))
                  }>
                  Gebruiker IP
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('opinion', e, filterData))
                  }>
                  Voorkeur
                </button>
              </ListHeading>
            </div>
            <ul className="admin-overview">
              {filterData?.map((vote: any) => {
                const userId = vote.userId;
                const user =
                  usersData?.find((user: any) => user.id === userId) || null;
                const currentUserKey =
                  !!user && user.idpUser?.identifier && user.idpUser?.provider
                    ? `${user.idpUser.provider}-*-${user.idpUser.identifier}`
                    : user?.id?.toString() || 'unknown';

                return (
                  <li
                    key={vote.id}
                    className="grid grid-cols-3 lg:grid-cols-8 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="col-span-1 truncate">
                      <Paragraph>{vote.id}</Paragraph>
                    </div>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-2">
                      {vote.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      <a
                        href={`/projects/${project}/resources/${vote.resourceId}`}
                        style={{ textDecoration: 'underline' }}>
                        {vote.resourceId}
                      </a>
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      <a
                        href={`/users/${btoa(currentUserKey)}`}
                        style={{ textDecoration: 'underline' }}>
                        {vote.userId}
                      </a>
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      {vote.ip}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1 -mr-16">
                      {vote.opinion}
                    </Paragraph>
                    <div
                      onClick={(e) => e.preventDefault()}
                      className="hidden lg:flex ml-auto">
                      <RemoveResourceDialog
                        header="Stem verwijderen"
                        message="Weet je zeker dat je deze stem wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(vote.id)
                            .then(() =>
                              toast.success('Stem successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Stem kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex justify-center">
              {totalPages > 0 && (
                <Paginator
                  page={page || 0}
                  totalPages={totalPages || 1}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
