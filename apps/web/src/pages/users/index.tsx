import React from 'react';
import { PageLayout } from '../../components/ui/page-layout';
import { ListHeading, Paragraph } from '../../components/ui/typography';
import { CreateUserDialog } from '@/components/dialog-user-create';
import Link from 'next/link';
import usersSwr from '@/hooks/use-users';

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
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden lg:flex">ID</ListHeading>
              <ListHeading className="hidden lg:flex">E-mail</ListHeading>
              <ListHeading className="hidden lg:flex">Displaynaam</ListHeading>
            </div>
            <ul>
              {data?.map((user: any) => (
                <Link href={`/users/${user.id}`} key={user.id}>
                  <li className="grid grid-cols-1 lg:grid-cols-3 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <Paragraph className="hidden lg:flex truncate">
                      {user.id}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {user.email}
                    </Paragraph>
                    <Paragraph className="truncate">
                      {user.displayName}
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
