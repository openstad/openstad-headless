import { PageLayout} from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
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
            <div className="grid grid-cols-1 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex truncate">ID</ListHeading>
              <ListHeading className="flex truncate">Code</ListHeading>
              <ListHeading className="hidden lg:flex truncate">
                Al gebruikt
              </ListHeading>
            </div>
            <ul>
              {codes?.data.map((code: any) => (
                <li className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <Paragraph className="hidden lg:flex truncate">{code.id || null}</Paragraph>
                  <Paragraph className="hidden lg:flex truncate">{code.code || null}</Paragraph>
                  <Paragraph className="flex truncate -mr-16">{code.used}</Paragraph>
                  <Paragraph className="flex">
                    <ChevronRight
                      strokeWidth={1.5}
                      className="w-5 h-5 my-auto ml-auto"
                    />
                  </Paragraph>
                </li>
              ))}  
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  )
}
