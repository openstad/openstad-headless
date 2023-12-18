import { PageLayout } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';
import React from 'react';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { useRouter } from 'next/router';
import projectListSwr from '../../hooks/use-project-list';

export default function Projects() {
  const { data, isLoading, error } = projectListSwr();
  const router = useRouter();

  if (!data) return null;

  const headers = [
    'Projectnaam',
    'Issues',
    'Likes',
    'Reacties',
    'Resources',
    'Stemmen',
    'Einddatum',
  ];

  return (
    <div>
      <PageLayout
        pageHeader="Projects"
        breadcrumbs={[
          {
            name: 'Projects',
            url: '/projects',
          },
        ]}
        action={
          <Link href="/projects/create">
            <Button variant="default" className="flex w-fit">
              <Plus size="20" className="hidden lg:flex" />
              Project toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-1 lg:grid-cols-11 items-center py-2 px-2 border-b border-border">
              {headers.map((header) => (
                <ListHeading className="hidden lg:flex" key={header}>
                  {header}
                </ListHeading>
              ))}
            </div>
            <ul>
              {data.map((project: any) => {
                return (
                  <li
                    className="grid grid-cols-2 lg:grid-cols-11 items-center py-3 px-2 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2"
                    key={project.id}
                    onClick={(d) => {
                      router.push(`${router.asPath}/${project.id}/widgets`);
                    }}>
                    <Paragraph className="truncate">{project.name}</Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      Geen
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {project?.config?.resource?.enableLikes === true ? 'Aan' : 'Uit'}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {project?.config?.resource?.enableReactions === true ? 'Aan' : 'Uit'}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      Open
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate">
                      {project?.config?.votes?.isActive === true ? 'Aan' : 'Uit'}
                    </Paragraph>
                    <Paragraph className="hidden lg:flex truncate -mr-16">
                      {project?.config?.project?.endDate}
                    </Paragraph>
                    <Paragraph className="flex">
                      <ChevronRight
                        strokeWidth={1.5}
                        className="w-5 h-5 my-auto ml-auto"
                      />
                    </Paragraph>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
