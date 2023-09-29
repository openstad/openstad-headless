import React from 'react'
import { PageLayout } from "../../components/ui/page-layout";
import { ListHeading, Paragraph } from '../../components/ui/typography';
import usePagination from '../../hooks/pagination'
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils'
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Users() {

    const {
      page,
      next,
      previous,
      goToPage,
      hasNext,
      hasPrevious,
      pages,
      goToFirst,
      goToLast,
    } = usePagination();

    const meta = {
      total: 3,
      size: 4,
      page: 2,
      results: 3,
    };

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
            <Link href="/users/create">
              <Button variant="default">
                <Plus size="20" />
                Gebruiker toevoegen
              </Button>
            </Link>
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
              </ul>
              <div className='flex flex-col md:flex-row-reverse items-center justify-between mt-4'>
                <div className='flex flex-row items-center'>
                  {hasPrevious(meta) && (
                    <>
                      <Button variant="default" size="sm" onClick={goToFirst}>
                        First page
                      </Button>
                      <Button variant="default" size="sm" onClick={previous}>
                        Previous
                      </Button>
                    </>
                  )}
                  {pages(meta).map(({number, isActive}) => (
                    <Button
                    key={number}
                    className={cn(
                      isActive &&
                      'bg-primary text-primary-foreground hover: bg/primary/90'
                    )}
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(number)}>
                      {number}
                    </Button>
                  ))}
                  {hasNext(meta) && (
                    <>
                      <Button variant="default" size="sm" onClick={next}>
                        Next                     
                      </Button>
                      <Button variant="default" size="sm" onClick={() => goToLast(meta)}>
                        Last Page
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </PageLayout>
        </div>
      )
}