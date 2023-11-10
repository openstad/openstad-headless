import { PageLayout } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import useSWR from 'swr';
import React from 'react';
import { useRouter } from 'next/router';
import { ListHeading } from '@/components/ui/typography';

export default function ProjectCodes() {
  const router = useRouter();
  const { project } = router.query;
  const { data, isLoading } = useSWR('/api/openstad/api/project');

  if (!data) return null;

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
            name: 'Stemcodes',
            url: `/projects/${project}/codes`,
          },
        ]}
        action={
          <div className="flex flex-row w-full md:w-auto my-auto">
            <Link href="/projects/1/codes/create">
              <Button variant="default" className="text-xs p-2 w-fit">
                <Plus size="20" className="hidden md:flex" />
                Stemcodes toevoegen
              </Button>
            </Link>
            <Link href="/projects/1/codes/export" className="ml-2">
              <Button variant="default" className="text-xs p-2 w-fit">
                Exporteer stemcodes
              </Button>
            </Link>
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
        </div>
      </PageLayout>
    </div>
  );
}
