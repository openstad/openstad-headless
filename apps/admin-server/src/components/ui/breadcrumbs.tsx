'use client';

import { cn } from '@/lib/utils';
import { Paragraph } from './typography';
import Link from 'next/link';
import React from 'react';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: any }) {
  return (
    <div className="flex flex-row items-center">
      {breadcrumbs.map(
        (breadcrumb: any, index: number, { length }: { length: any }) => (
          <React.Fragment key={index}>
            {index != 0 ? (
              <Paragraph className="mx-1 text-muted-foreground leading-none">
                /
              </Paragraph>
            ) : null}
            <Link href={breadcrumb.url}>
              <Paragraph
                className={cn(
                  'whitespace-nowrap text-ellipsis overflow-hidden',
                  index + 1 === length
                    ? ''
                    : ' max-w-[60px] md:max-w-none text-muted-foreground'
                )}>
                {breadcrumb.name}
              </Paragraph>
            </Link>
          </React.Fragment>
        )
      )}
    </div>
  );
}
