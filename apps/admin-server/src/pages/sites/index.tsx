import React from 'react';
import { PageLayout } from '../../components/ui/page-layout';
import { ListHeading, Paragraph } from '../../components/ui/typography';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Sites() {
  return (
    <div>
      <PageLayout
        pageHeader="Sites"
        breadcrumbs={[
          {
            name: 'Sites',
            url: '/sites',
          },
        ]}
        action={
          <Link href="/sites/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Site toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">ID</ListHeading>
              <ListHeading className="hidden lg:flex">Sitenaam</ListHeading>
              <ListHeading className="hidden lg:flex">Projectnaam</ListHeading>
            </div>
            <ul>
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
