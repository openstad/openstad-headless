import React from 'react';
import { PageLayout } from '../../components/ui/page-layout';
import { ListHeading, Paragraph } from '../../components/ui/typography';
import { CreateUserDialog } from '@/components/dialog-user-create';
import Link from 'next/link';
import usersSwr from '@/hooks/use-users';
import { ChevronRight } from 'lucide-react';

export default function Users() {
  const { data, isLoading } = usersSwr();

  if (!data) return null;

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
        action={<CreateUserDialog />}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">ID</ListHeading>
              <ListHeading className="hidden lg:flex">E-mail</ListHeading>
              <ListHeading className="hidden lg:flex">Displaynaam</ListHeading>
            </div>
            <ul>
              {data?.map((user: any) => (
                <Link href={`/users/${user.id}`} key={user.id}>
                  <li className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="hidden lg:flex truncate">
                      {user.id}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {user.email}
                    </Paragraph>
                    <Paragraph className="truncate -mr-16">
                      {user.displayName}
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
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
