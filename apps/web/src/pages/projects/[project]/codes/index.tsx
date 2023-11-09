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
            name: 'Stem codes',
            url: `/projects/${project}/codes`,
          },
        ]}
        action={
          <div className="flex">
            <Link href="/projects/1/codes/create">
              <Button variant="default">
                <Plus size="20" />
                Creëer unieke codes
              </Button>
            </Link>
            <Link href="/projects/1/codes/export" className="pl-6">
              <Button variant="default">Exporteer unieke codes</Button>
            </Link>
          </div>
        }>
        <div className="container mx-auto py-10">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
            <ListHeading className="hidden md:flex md:col-span-3">
              ID
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-2">
              Code
            </ListHeading>
            <ListHeading className="hidden md:flex md:col-span-2">
              Al gebruikt
            </ListHeading>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
