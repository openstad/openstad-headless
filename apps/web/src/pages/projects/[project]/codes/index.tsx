import { PageLayout} from "@/components/ui/page-layout"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable } from "../../../../components/tables/ideas/data-table";
import { columns } from "../../../../components/tables/ideas/columns";
import useSWR from "swr"
import React from "react";

export default function ProjectCodes() {
    const { data, isLoading } = useSWR("/api/openstad/api/project");

    if (!data) return null;

    return (
        <div>
            <PageLayout
                pageHeader="Projecten"
                breadcrumbs={[
                    {
                        name: "Projecten",
                        url: "/projects"
                    },
                    {
                        name: "Stem codes",
                        url: "/projects/1/codes"
                    }
                ]}
                action={
                    <div className="flex">
                        <Link href="/projects/1/codes/create">
                            <Button variant="default">
                                <Plus size="20" />
                                Creëer unieke codes
                            </Button>
                        </Link>
                        <Link href="/projects/1/codes/export" className="pl-6">
                            <Button variant="default">
                                Exporteer unieke codes
                            </Button>
                        </Link>
                    </div>
                }
            >
                <div className="container">
                    <DataTable columns={columns} data={data} />
                </div>
            </PageLayout>
        </div>
    )
}