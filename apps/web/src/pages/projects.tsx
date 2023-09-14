import { PageLayout } from "@/components/ui/page-layout"
import { columns } from "./table/columns"
import { DataTable } from "./table/data-table"
import { Button } from "@/components/ui/button"
import Link from 'next/link';

export default function DemoPage() {
  const data = [
    {
      id: "728ed52f",
      projectName: "Project",
      data: "Data",
      issues: "Issues",
      status: "Status",
      react: "Reageren",
      like: "Liken",
      submitter: "Toevoeger",
      resources: "Resources",
    },
    // ...
  ]

  return (
    <div>
      <PageLayout
      pageHeader="Projecten"
      breadcrumbs={[
        {
          name: 'Projecten',
          url: '/projects',
        },
      ]}
      action={
        <Button variant="create" className="float-right">
          <Link href="/projects/create">
            + Nieuw
          </Link>
        </Button>  
      }
      >
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
      </PageLayout>
    </div>
  )
}
