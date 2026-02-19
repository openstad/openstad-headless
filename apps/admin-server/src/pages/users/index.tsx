import { Button } from '@/components/ui/button';
import { sortTable } from '@/components/ui/sortTable';
import { useUsers, type userType } from '@/hooks/use-users';
import { ChevronLeft, ChevronRight, Loader, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from 'rooks';
import * as XLSX from 'xlsx';

import { PageLayout } from '../../components/ui/page-layout';
import { ListHeading, Paragraph } from '../../components/ui/typography';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 600;

type MergedType = {
  [key: string]: userType & { key?: string };
};

export default function Users() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiSearch] = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);

  const { data, metadata, isValidating } = useUsers({
    page: currentPage,
    pageSize: PAGE_SIZE,
    q: apiSearch || undefined,
  });
  const lastDataRef = useRef<userType[] | null>(null);
  const [users, setUsers] = useState<userType[]>([]);

  useEffect(() => {
    if (!data) return;
    lastDataRef.current = data;
    const merged: MergedType = {};
    data.forEach((user: userType) => {
      const key =
        user.idpUser?.identifier && user.idpUser?.provider
          ? `${user.idpUser.provider}-*-${user.idpUser.identifier}`
          : user.id?.toString() || 'unknown';
      merged[key] = user;
    });
    setUsers(Object.keys(merged).map((key) => ({ ...merged[key], key })));
  }, [data]);

  useEffect(() => {
    setCurrentPage(0);
  }, [apiSearch]);

  const [filterData, setFilterData] = useState<userType[]>([]);

  useEffect(() => {
    setFilterData(users);
  }, [users]);

  if (!data && !lastDataRef.current) return null;

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
    exportData(data, `${projectId}_gebruikers_${formattedDate}.xlsx`);
  }

  return (
    <div>
      <PageLayout
        pageHeader="Gebruikers"
        breadcrumbs={[
          {
            name: 'Gebruikers',
            url: '/users',
          },
        ]}
        action={
          <div className="flex flex-row w-full md:w-auto my-auto gap-4">
            <Link href="/users/create">
              <Button variant="default" className="flex w-fit">
                <Plus size="20" className="hidden lg:flex" />
                Gebruiker toevoegen
              </Button>
            </Link>
            <Button
              className="text-xs p-2 w-fit"
              type="submit"
              onClick={transform}>
              Exporteer gebruikers
            </Button>
          </div>
        }>
        <div className="container py-6">
          <div className="float-right mb-4 flex gap-4">
            <p className="text-xs font-medium text-muted-foreground self-center">
              Zoeken (naam, e-mail, postcode):
            </p>
            <input
              type="text"
              className="p-2 rounded"
              placeholder="Zoeken..."
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right relative">
            {isValidating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md z-10">
                <Loader className="animate-spin" size={32} strokeWidth={2} />
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('id', e, filterData))
                  }>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('email', e, filterData))
                  }>
                  E-mail
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('name', e, filterData))
                  }>
                  Naam
                </button>
              </ListHeading>
              <ListHeading className="hidden lg:flex">
                <button
                  className="filter-button"
                  onClick={(e) =>
                    setFilterData(sortTable('postcode', e, filterData))
                  }>
                  Postcode
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((user: any) => (
                <Link href={`/users/${btoa(user.key)}`} key={user.key}>
                  <li className="grid grid-cols-2 lg:grid-cols-5 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="hidden lg:flex truncate">
                      {user.id}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {user.email}
                    </Paragraph>
                    <Paragraph className="truncate -mr-16">
                      {user.name}
                    </Paragraph>
                    <Paragraph className="truncate -mr-16">
                      {user.postcode}
                    </Paragraph>
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

            {metadata && metadata.pageCount > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                <Paragraph className="text-sm text-muted-foreground">
                  Pagina {metadata.page + 1} van {metadata.pageCount} (
                  {metadata.totalCount} gebruikers)
                </Paragraph>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((currentPage) =>
                        Math.max(0, currentPage - 1)
                      )
                    }
                    disabled={metadata.page <= 0}>
                    <ChevronLeft className="w-4 h-4" />
                    Vorige
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((currentPage) =>
                        Math.min(metadata.pageCount - 1, currentPage + 1)
                      )
                    }
                    disabled={metadata.page >= metadata.pageCount - 1}>
                    Volgende
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
