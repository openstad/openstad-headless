import { PageLayout } from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';
import useAccessCodes from '@/hooks/use-access-codes';
import { searchTable, sortTable } from '@/components/ui/sortTable';
import { exportToXLSX } from '@/lib/export-helpers/xlsx-export';
import {RemoveResourceDialog} from "@/components/dialog-resource-remove";

export default function ProjectCodes() {
  const router = useRouter();
  const { project } = router.query;
  const { data: accesscodes, deleteAccessCode } = useAccessCodes(project as string);


  const [filterData, setFilterData] = useState(accesscodes?.data);
  const [filterSearchType, setFilterSearchType] = useState<string>('');
  const debouncedSearchTable = searchTable(setFilterData, filterSearchType);

  function transform() {
    const keyMap: Record<string, string> = {
      'id': 'ID',
      'code': 'Toegangscode',
      'createdAt': 'Aangemaakt op',
      'updatedAt': 'Bijgewerkt op',
    };

    const today = new Date();
    const projectId = router.query.project;
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
    exportToXLSX(accesscodes?.data, `${projectId}_toegangscodes_${formattedDate}.xlsx`, keyMap);
  }

  useEffect(() => {
    let codes = accesscodes?.data || [];
    codes = codes?.sort((a: any, b: any) => a.id - b.id);

    setFilterData(codes);
  }, [accesscodes])
  
  if (!accesscodes?.data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
          },
          {
            name: 'Toegangscodes',
            url: `/projects/${project}/access-codes`,
          },
        ]}
        action={
          <div className='flex flex-row w-full md:w-auto my-auto gap-4'>
            <Link href={`/projects/${project}/access-codes/create`}>
              <Button variant="default" className="text-xs p-2 w-fit">
                <Plus size="20" className="hidden md:flex" />
                Toegangscode toevoegen
              </Button>
            </Link>
            <Button className="text-xs p-2 w-fit" type="submit" onClick={transform}>
              Exporteer toegangscodes
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
              <option value="id">ID</option>
              <option value="code">Code</option>
            </select>
            <input
              type="text"
              className='p-2 rounded'
              placeholder="Zoeken..."
              onChange={(e) => debouncedSearchTable(e.target.value, filterData, accesscodes?.data)}
            />
          </div>

          <div className="p-6 bg-white rounded-md clear-right">
            <div className="grid grid-cols-1 lg:grid-cols-3 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('id', e, filterData))}>
                  ID
                </button>
              </ListHeading>
              <ListHeading className="flex truncate">
                <button className="filter-button" onClick={(e) => setFilterData(sortTable('code', e, filterData))}>
                  Toegangscode
                </button>
              </ListHeading>
            </div>
            <ul>
              {filterData?.map((code: any) => (
                <li key={code.id} className="grid grid-cols-2 lg:grid-cols-3 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <Paragraph className="hidden lg:flex truncate">{code.id || null}</Paragraph>
                  <Paragraph className="hidden lg:flex truncate">{code.code || null}</Paragraph>
                  <div
                    onClick={(e) => e.preventDefault()}
                    className="hidden lg:flex ml-auto">
                    <RemoveResourceDialog
                      header="Toegangscode verwijderen"
                      message="Weet je zeker dat je deze toegangscode wilt verwijderen?"
                      onDeleteAccepted={() =>
                        deleteAccessCode(code.id)
                          .then(() =>
                            toast.success('Toegangscode verwijderd')
                          )
                          .catch((e) =>
                            toast.error('Toegangscode kon niet worden verwijderd')
                          )
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  )
}
