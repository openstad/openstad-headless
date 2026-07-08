import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageLayout } from '@/components/ui/page-layout';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import useUniqueCodes from '@/hooks/use-unique-codes';
import { exportToXLSX } from '@/lib/export-helpers/xlsx-export';
import { Paginator } from '@openstad-headless/ui/src';
import { MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebouncedValue } from 'rooks';

type SortDirection = 'ASC' | 'DESC';

export default function ProjectCodes() {
  const router = useRouter();
  const { project } = router.query;

  const [page, setPage] = useState(0);
  const [pageLimit, setPageLimit] = useState<number | 'all'>(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 400);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC');

  const effectivePageSize = pageLimit === 'all' ? totalCount || 50 : pageLimit;

  const {
    data: uniquecodes,
    fetchAllUniqueCodes,
    resetUniqueCode,
  } = useUniqueCodes(
    project as string,
    page,
    effectivePageSize,
    debouncedSearch || undefined,
    `${sortField}_${sortDirection}`
  );

  useEffect(() => {
    if (uniquecodes) {
      const total = uniquecodes.total ?? 0;
      setTotalCount(total);
      setTotalPages(
        Math.ceil(total / (pageLimit === 'all' ? total || 1 : pageLimit))
      );
    }
  }, [uniquecodes, pageLimit]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, sortField, sortDirection]);

  function handleSort(field: string) {
    if (field === sortField) {
      setSortDirection((d) => (d === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortField(field);
      setSortDirection('DESC');
    }
  }

  function getSortButtonClass(field: string) {
    if (field !== sortField) return 'filter-button';
    return `filter-button font-bold text-black${sortDirection === 'ASC' ? ' --up' : ''}`;
  }

  async function handleExport() {
    try {
      const allCodes = await fetchAllUniqueCodes();

      const uniqueCodesData = allCodes?.data?.flat().map((code: any) => ({
        ...code,
        userId: code.userId ? 'Ja' : 'Nee',
      }));

      const keyMap: Record<string, string> = {
        id: 'Stem ID',
        code: 'Code',
        userId: 'Gebruikt',
        createdAt: 'Aangemaakt op',
        updatedAt: 'Bijgewerkt op',
      };

      const today = new Date();
      const projectId = router.query.project;
      const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
      exportToXLSX(
        uniqueCodesData,
        `${projectId}_stemcodes_${formattedDate}.xlsx`,
        keyMap
      );
    } catch (err) {
      toast.error('Kon stemcodes niet exporteren');
    }
  }

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
          breadcrumbs={[
            {
              name: 'Projecten',
              url: '/projects',
            },
            {
              name: 'Stemcodes',
              url: `/projects/${project}/unique-codes`,
            },
          ]}
          action={
            <div className="flex flex-row w-full md:w-auto my-auto gap-4">
              <Link href={`/projects/${project}/unique-codes/create`}>
                <Button variant="default" className="text-xs p-2 w-fit">
                  <Plus size="20" className="hidden md:flex" />
                  Stemcodes toevoegen
                </Button>
              </Link>
              <Button
                className="text-xs p-2 w-fit"
                type="submit"
                onClick={handleExport}>
                Exporteer stemcodes
              </Button>
            </div>
          }>
          <div className="container py-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                {totalCount} stemcode{totalCount !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-4 items-center">
                <p className="text-xs font-medium text-muted-foreground self-center">
                  Zoeken:
                </p>
                <input
                  type="text"
                  className="p-2 rounded border"
                  placeholder="Zoek op code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-white rounded-md">
              <div className="grid grid-cols-4 items-center py-2 px-2 border-b border-border">
                <ListHeading className="truncate">
                  <button
                    className={getSortButtonClass('id')}
                    onClick={() => handleSort('id')}>
                    ID
                  </button>
                </ListHeading>
                <ListHeading className="truncate">
                  <button
                    className={getSortButtonClass('code')}
                    onClick={() => handleSort('code')}>
                    Code
                  </button>
                </ListHeading>
                <ListHeading className="truncate">
                  <button
                    className={getSortButtonClass('userId')}
                    onClick={() => handleSort('userId')}>
                    Gebruikt
                  </button>
                </ListHeading>
                <ListHeading className="truncate" />
              </div>
              <ul className="admin-overview">
                {!uniquecodes && (
                  <li className="py-4 px-2 text-sm text-gray-500">Laden...</li>
                )}
                {uniquecodes && uniquecodes.data?.length === 0 && (
                  <li className="py-4 px-2 text-sm text-gray-500">
                    Geen stemcodes gevonden.
                  </li>
                )}
                {uniquecodes?.data?.map((code: any) => (
                  <li
                    key={code.id}
                    className="grid grid-cols-4 items-center py-3 px-2 hover:bg-muted transition-all duration-200 border-b">
                    <Paragraph className="truncate">{code.id}</Paragraph>
                    <Paragraph className="truncate">{code.code}</Paragraph>
                    <Paragraph className="truncate">
                      {!!code.userId ? 'Gebruikt' : ''}
                    </Paragraph>
                    {!!code.userId ? (
                      <div
                        className="flex ml-auto"
                        onClick={(e) => e.preventDefault()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="focus:outline-none">
                            <MoreHorizontal className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                resetUniqueCode(code.id)
                                  .then(() =>
                                    toast.success('Stemcode successvol gereset')
                                  )
                                  .catch(() =>
                                    toast.error(
                                      'Stemcode kon niet worden gereset'
                                    )
                                  );
                              }}
                              className="text-xs">
                              Reset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>

              {totalPages > 0 && (
                <div className="flex flex-col items-center gap-4 mt-4">
                  {pageLimit !== 'all' && (
                    <Paginator
                      page={page}
                      totalPages={totalPages}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Rijen per pagina:
                    </span>
                    <select
                      className="p-2 rounded border"
                      value={String(pageLimit)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPageLimit(val === 'all' ? 'all' : Number(val));
                        setPage(0);
                      }}>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={250}>250</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                      <option value="all">Alles</option>
                    </select>
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
