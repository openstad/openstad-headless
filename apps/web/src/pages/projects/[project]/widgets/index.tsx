import { PageLayout } from "@/components/ui/page-layout";
import { Heading, ListHeading, Paragraph } from "@/components/ui/typography";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function ProjectWidgets() {
  const router = useRouter();
  const { project } = router.query;

  const { data: widgetTypes, isLoading } = useSWR(
    `/api/openstad/api/widget-types`
  );

  const { data: widgets, isLoading: isLoadingWidgets } = useSWR(
    project
      ? `/api/openstad/api/project/${project}/widgets?includeType=1`
      : null
  );

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
