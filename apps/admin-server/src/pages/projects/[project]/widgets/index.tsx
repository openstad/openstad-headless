import { CreateWidgetDialog } from '@/components/dialog-widget-create';
import { PageLayout } from '@/components/ui/page-layout';
import { ListHeading, Paragraph } from '@/components/ui/typography';
import { Widget, useWidgetsHook } from '@/hooks/use-widgets';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ProjectWidgets() {
  const router = useRouter();
  const { project } = router.query;

  const { data: widgets, isLoading: isLoadingWidgets } = useWidgetsHook(
    project as string
  );

  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Widgets',
            url: `/projects/${project}/widgets`,
          },
        ]}
        action={<CreateWidgetDialog projectId={project as string} />}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <div className="grid grid-cols-2 lg:grid-cols-4 items-center py-2 px-2 border-b border-border">
              <ListHeading className="hidden md:flex">Widget</ListHeading>
              <ListHeading className="hidden md:flex">
                Toegevoegd op
              </ListHeading>
              <ListHeading className="hidden md:flex">Gewijzigd op</ListHeading>
            </div>

            <ul>
              {(widgets as Widget[])?.map((widget) => (
                <Link
                  key={widget.id}
                  href={`/projects/${project}/widgets/${widget.type}/${widget.id}`}>
                  <li className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                    <div className="">
                      <strong className="">
                        {WidgetDefinitions[widget.type]}
                      </strong>
                      <Paragraph>{widget.description}</Paragraph>
                    </div>
                    <Paragraph className="hidden md:flex truncate my-auto">
                      {widget.createdAt}
                    </Paragraph>
                    <Paragraph className="hidden md:flex truncate my-auto -mr-16">
                      {widget.updatedAt}
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
