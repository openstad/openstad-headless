import { PageLayout } from '../../../components/ui/page-layout';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useVotes from '@/hooks/use-votes';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import useUsers from "@/hooks/use-users";
import { sortTable, searchTable } from '@/components/ui/sortTable';
import * as XLSX from 'xlsx';

export default function ProjectResources() {
  const router = useRouter();
  const { project } = router.query;
  const { data, remove } = useVotes(project as string);

  const [filterData, setFilterData] = useState(data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  const exportData = (data: any[], fileName: string) => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, fileName);
  };
  function transform() {
    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
    exportData(data, `${projectId}_stemmen_${formattedDate}.xlsx`);
  }

  const { data: usersData } = useUsers();

  useEffect(() => {
    setFilterData(data);
  }, [data])

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
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
          <div className='flex flex-row w-full md:w-auto my-auto'>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer stemmen
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
              <option value="id">Stem ID</option>
              <option value="createdAt">Stemdatum</option>
              <option value="resourceId">Plan ID</option>
              <option value="userId">Gebruiker ID</option>
              <option value="ip">Gebruiker IP</option>
              <option value="opinion">Voorkeur</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, data)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-8 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  Stem ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-2">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('createdAt', e, filterData))}>
                  Stemdatum
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('resourceId', e, filterData))}>
                  Plan ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('userId', e, filterData))}>
                  Gebruiker ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('ip', e, filterData))}>
                  Gebruiker IP
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex lg:col-span-1">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('opinion', e, filterData))}>
                  Voorkeur
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((vote: any) => {
                const userId = vote.userId;
                const user = usersData?.find((user: any) => user.id === userId) || null;
                const currentUserKey = !!user && user.idpUser?.identifier && user.idpUser?.provider ? `${user.idpUser.provider}-*-${user.idpUser.identifier}` : (user?.id?.toString() || 'unknown');

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
                      <a href={`/projects/${project}/resources/${vote.resourceId}`} style={{ textDecoration: 'underline' }}>{vote.resourceId}</a>
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate lg:col-span-1">
                      <a href={`/users/${btoa(currentUserKey)}`} style={{ textDecoration: 'underline' }}>{vote.userId}</a>
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
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
