import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { Button } from '@/components/ui/button';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useUsers from '@/hooks/use-users';
import useVotes from '@/hooks/use-votes';
import { exportToXLSX } from '@/lib/export-helpers/xlsx-export';
import { Paginator } from '@openstad-headless/ui/src';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebouncedValue } from 'rooks';

import { PageLayout } from '../../../components/ui/page-layout';

type SortDirection = 'asc' | 'desc';

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { remove } = useVotes(project as string);
  const [votes, setVotes] = useState<{ createdAt: string; id?: string }[]>([]);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiSearchTerm] = useDebouncedValue(searchTerm, 400);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  const fetchResults = async (
    page: number,
    options?: { includeFilters?: boolean; includeSorting?: boolean }
  ) => {
    try {
      const projectNumber = parseInt(project as string);

      if (isNaN(projectNumber) || isNaN(page) || isNaN(pageLimit)) {
        return;
      }

      const includeFilters = options?.includeFilters ?? true;
      const includeSorting = options?.includeSorting ?? true;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageLimit.toString(),
        pageSize: pageLimit.toString(),
        includeResource: '1',
      });

      if (includeSorting) {
        params.set('sortBy', sortField);
        params.set('orderBy', sortDirection.toUpperCase());
      }

      if (includeFilters && filterSearchType && apiSearchTerm) {
        if (filterSearchType === 'id' && Number(apiSearchTerm) > 0) {
          params.set('id', apiSearchTerm);
        }
        if (filterSearchType === 'createdAt') {
          params.set('createdAt', apiSearchTerm);
        }
        if (filterSearchType === 'resourceId' && Number(apiSearchTerm) > 0) {
          params.set('resourceId', apiSearchTerm);
        }
        if (filterSearchType === 'userId' && Number(apiSearchTerm) > 0) {
          params.set('userId', apiSearchTerm);
        }
        if (filterSearchType === 'ip') {
          params.set('ip', apiSearchTerm);
        }
        if (
          filterSearchType === 'opinion' &&
          (apiSearchTerm === 'yes' || apiSearchTerm === 'no')
        ) {
          params.set('opinion', apiSearchTerm);
        }
      }

      const url = `/api/openstad/api/project/${projectNumber}/vote?${params.toString()}`;

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
        setTotalCount(totalCount);
        setVotes(data);
      }
    });
  }, [
    apiSearchTerm,
    filterSearchType,
    page,
    project,
    sortDirection,
    sortField,
  ]);

  useEffect(() => {
    setPage(0);
  }, [apiSearchTerm, filterSearchType, sortDirection, sortField]);

  const fetchAllResults = async () => {
    let allData: any[] = [];
    let currentPage = 0;
    let totalPages = Math.ceil(totalCount / pageLimit);
    while (currentPage < totalPages) {
      // eslint-disable-next-line no-await-in-loop
      const results = await fetchResults(currentPage, {
        includeFilters: false,
        includeSorting: false,
      });
      const data = results?.records || [];
      allData = allData.concat(data);
      currentPage += 1;
    }

    return allData;
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortButtonClass = (field: string) => {
    if (field !== sortField) return 'filter-button';
    return `filter-button font-bold text-black ${sortDirection === 'asc' ? '--up' : ''}`;
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
              value={filterSearchType}
              onChange={(e) => setFilterSearchType(e.target.value)}>
              <option value="">Alles</option>
              <option value="id">Stem ID</option>
              <option value="createdAt">Stemdatum</option>
              <option value="resourceId">Plan ID</option>
              <option value="userId">Gebruiker ID</option>
              <option value="ip">Gebruiker IP</option>
              <option value="opinion">Voorkeur</option>
            </select>
            <input
              type="text"
              className="p-2 rounded"
              placeholder="Zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className={getSortButtonClass('id')}
                  onClick={() => handleSort('id')}>
                  Stem ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                <button
                  className={getSortButtonClass('createdAt')}
                  onClick={() => handleSort('createdAt')}>
                  Stemdatum
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className={getSortButtonClass('resourceId')}
                  onClick={() => handleSort('resourceId')}>
                  Plan ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className={getSortButtonClass('userId')}
                  onClick={() => handleSort('userId')}>
                  Gebruiker ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className={getSortButtonClass('ip')}
                  onClick={() => handleSort('ip')}>
                  Gebruiker IP
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button
                  className={getSortButtonClass('opinion')}
                  onClick={() => handleSort('opinion')}>
                  Voorkeur
                </button>
              </ListHeading>
            </div>
            <ul className="admin-overview">
              {votes?.map((vote: any) => {
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
