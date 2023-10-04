import useSWR from "swr";
import { PageLayout } from "@/components/ui/page-layout";
import { columns } from "../table/columns";
import { DataTable } from "../table/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React from "react";
import { useRouter } from "next/router";

export default function Projects() {
  const { data, isLoading } = useSWR("/api/openstad/api/project");
  const router = useRouter();
  
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
          <DataTable columns={columns} data={data} onRowClick={(d) =>{
            router.push(`${router.asPath}/${d.original.id}/widgets`)}
            }/>
        </div>
      </PageLayout>
    </div>
  );
}
