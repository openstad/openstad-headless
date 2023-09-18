import useSWR from "swr";
import { PageLayout } from "@/components/ui/page-layout";
import { columns } from "../table/columns";
import { DataTable } from "../table/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function DemoPage() {
  const { data, isLoading } = useSWR("/api/openstad/api/project");

  if (!data) return null;

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: "Projecten",
            url: "/projects",
          },
        ]}
        action={
          <Link href="/projects/create">
            <Button variant="default">
              <Plus size="20" />
              Project toevoegen
            </Button>
          </Link>
        }
      >
        <div className="container">
          <DataTable columns={columns} data={data} />
        </div>
      </PageLayout>
    </div>
  );
}
