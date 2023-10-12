import { CreateWidgetDialog } from "@/components/dialog-widget-create";
import { PageLayout } from "@/components/ui/page-layout";
import { ListHeading, Paragraph } from "@/components/ui/typography";
import { useWidgetsHook } from "@/hooks/use-widgets-hook";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";


export default function ProjectWidgets() {
  const router = useRouter();
  const { project } = router.query;

  const { data: widgets, isLoading:isLoadingWidgets } = useWidgetsHook(project as string);
  
  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: "Projecten",
            url: "/projects",
          },
          {
            name: "Widgets",
            url: `/projects/${project}/widgets`,
          },
        ]}
        action={
          <CreateWidgetDialog projectId={project as string}/>
        }
      >
        <div className="container mx-auto py-10">
          <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 px-2 border-b border-border">
            <ListHeading className="hidden md:flex md:col-span-2">
              Widget
            </ListHeading>
          </div>

          <ul>
          {widgets?.map((widget: any) => (
              <Link
                key={widget.id}
                href={`/projects/${project}/widgets/${widget.widgetType.technicalName}/${widget.id}`}>
                <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                  <div className="col-span-3">
                  <strong className="">
                    {widget.widgetType.visibleName}
                  </strong>
                  <Paragraph>
                      {widget.description}
                  </Paragraph>
                  </div>
                  <Paragraph className="hidden md:flex md:col-span-3">
                    {widget.createdAt}
                  </Paragraph>
                  <Paragraph className="hidden md:flex md:col-span-3">
                    {widget.createdAt}
                  </Paragraph>
                  <Paragraph className="hidden md:flex md:col-span-3">
                    {widget.createdAt}
                  </Paragraph>
                </li>
              </Link>
          ))}
          </ul>
        </div>
      </PageLayout>
    </div>
  );
}
