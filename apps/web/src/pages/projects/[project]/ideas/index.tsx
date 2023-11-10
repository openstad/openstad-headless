import { PageLayout } from '../../../../components/ui/page-layout';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import React from 'react';
import useIdeas from '@/hooks/use-ideas';
import { useRouter } from 'next/router';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { RemoveResourceDialog } from '@/components/dialog-resource-remove';
import { toast } from 'react-hot-toast';

export default function ProjectIdeas() {
  const router = useRouter();
  const { project } = router.query;
  const { data, error, isLoading, remove } = useIdeas(project as string);

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Ideeën"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Ideeën',
            url: `/projects/${project}/ideas`,
          },
        ]}
        action={
          <Link
            href={`/projects/${project}/ideas/create`}
            className="flex w-fit">
            <Button variant="default">
              <Plus size="20" className="hidden lg:flex" />
              Idee toevoegen
            </Button>
          </Link>
        }>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-5 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden md:flex">Ideeën</ListHeading>
              <ListHeading className="hidden md:flex md:col-span-1">
                Gestemd op ja
              </ListHeading>
              <ListHeading className="hidden md:flex md:col-span-1">
                Gestemd op nee
              </ListHeading>
              <ListHeading className="hidden md:flex md:col-span-1">
                Datum aangemaakt
              </ListHeading>
              <ListHeading className="hidden md:flex md:col-span-1 ml-auto">
                Idee verwijderen
              </ListHeading>
            </div>
            <ul>
              {data?.map((idea: any) => (
                <Link
                  href={`/projects/${project}/ideas/${idea.id}`}
                  key={idea.id}>
                  <li className="grid grid-cols-5 py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="my-auto">
                      <Paragraph>{idea.title}</Paragraph>
                    </div>
                    <Paragraph className="hidden md:flex truncate my-auto">
                      {idea.yes || 0}
                    </Paragraph>
                    <Paragraph className="hidden md:flex truncate my-auto">
                      {idea.no || 0}
                    </Paragraph>
                    <Paragraph className="hidden md:flex truncate my-auto">
                      {idea.createDateHumanized}
                    </Paragraph>
                    <div
                      className="hidden md:flex ml-auto"
                      onClick={(e) => e.stopPropagation()}>
                      <RemoveResourceDialog
                        header="Idee verwijderen"
                        message="Weet je zeker dat je dit idee wilt verwijderen?"
                        onDeleteAccepted={() =>
                          remove(idea.id)
                            .then(() =>
                              toast.success('Idee successvol verwijderd')
                            )
                            .catch((e) =>
                              toast.error('Idee kon niet worden verwijderd')
                            )
                        }
                      />
                    </div>
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
