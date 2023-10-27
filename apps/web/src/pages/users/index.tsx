import React from 'react'
import { PageLayout } from "../../components/ui/page-layout";
import { ListHeading, Paragraph } from '../../components/ui/typography';
import { CreateUserDialog } from '@/components/dialog-user-create';
import Link from 'next/link';

export default function Users() {

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
          action={
            <CreateUserDialog />
          }
          >
            <div className="container mx-auto py-10">
              <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 px-2 border-b border-border">
                <ListHeading className="hidden md:flex md:col-span-2">
                  ID
                </ListHeading>
                <ListHeading className="hidden md:flex md:col-span-2">
                  Voornaam
                </ListHeading>
                <ListHeading className="hidden md:flex md:col-span-2">
                  Achternaam
                </ListHeading>
                <ListHeading className="hidden md:flex md:col-span-2">
                  E-mail
                </ListHeading>
              </div>
              <ul>
                <Link href={`/users/1`}>
                  <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                    <Paragraph className='hidden md:flex md:col-span-2'>
                      1
                    </Paragraph>
                    <Paragraph className='hidden md:flex md:col-span-2'>
                      Bart
                    </Paragraph>
                    <Paragraph className='hidden md:flex md:col-span-2'>
                      Wijfje
                    </Paragraph>
                    <Paragraph className='hidden md:flex md:col-span-2'>
                      bart@savvy.codes
                    </Paragraph>
                  </li>
                </Link>
              </ul>
            </div>
          </PageLayout>
        </div>
      )
}