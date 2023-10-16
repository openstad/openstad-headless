import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { DataTable } from '../../../../components/tables/ideas/data-table';
import { columns } from '../../../../components/tables/ideas/columns';
import useSWR from 'swr';
import React from 'react';
import useIdeas from '@/hooks/use-ideas';
import { useRouter } from 'next/router';

export default function ProjectIdeas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading } = useIdeas(project as string);

  console.log('rest');
  console.log({ data, error });
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
            name: 'Ideeën',
            url: '/projects/1/ideas',
          },
        ]}
        action={
          <Link href="/projects/1/ideas/create">
            <Button variant="default">
              <Plus size="20" />
              Maak een idee aan
            </Button>
          </Link>
        }>
        <div className="container">
          <DataTable columns={columns} data={data} />
        </div>
      </PageLayout>
    </div>
  );
}
