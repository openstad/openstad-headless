import { PageLayout} from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { CSVLink } from 'react-csv';
import { useProject } from '@/hooks/use-project';
import useSWR from 'swr';

const headers = [
  {label: "ID", key: "id"},
  {label: "Code", key: "code"}
]

export default function ProjectCodes() {
  const router = useRouter();
  const { project } = router.query;

  const { data, isLoading } = useProject();
  const { data:codes, isLoading:loadingCodes } = useSWR(() => '/api/oauth/api/admin/unique-codes?clientId=' + data.config.auth.provider.openstad.clientId);

  if(!codes?.data) return null;

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
            name: 'Stemcodes',
            url: `/projects/${project}/codes`,
          },
        ]}
        action={
          <div className="flex flex-row w-full md:w-auto my-auto">
            <Link href={`/projects/${project}/codes/create`}>
              <Button variant="default" className="text-xs p-2 w-fit">
                <Plus size="20" className="hidden md:flex" />
                Stemcodes toevoegen
              </Button>
            </Link>
            <Button variant="default" className="text-xs p-2 w-fit">
              <CSVLink data={codes.data} headers={headers}>
                Exporteer stemcodes
              </CSVLink>
            </Button>
          </div>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-6 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden md:flex md:col-span-2 truncate">
                ID
              </ListHeading>
              <ListHeading className="hidden md:flex md:col-span-1 truncate">
                Code
              </ListHeading>
              <ListHeading className="hidden md:flex md:col-span-1 truncate">
                Al gebruikt
              </ListHeading>
            </div>
          </div>
          <ul className="container mx-auto">
            {codes?.data.map((code: any) => (
              <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                <Paragraph className="hidden md:flex md:col-span-2">
                  {code.id || null}
                </Paragraph>
                <Paragraph className="hidden md:flex md:col-span-2">
                  {code.code || null}
                </Paragraph>
                <Paragraph className="hidden md:flex md:col-span-2">
                  {code.used}
                </Paragraph>
              </li>
            ))}
          </ul>
        </div>
      </PageLayout>
    </div>
  )
}
