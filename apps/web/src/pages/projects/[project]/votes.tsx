import { PageLayout} from "../../../components/ui/page-layout"
import { DataTable } from "../../../components/tables/ideas/data-table";
import { columns } from "../../../components/tables/ideas/columns";
import useSWR from "swr"
import React from "react";

export default function ProjectIdeas() {
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
                        name: "Stemmen",
                        url: "/projects/1/votes"
                    }
                ]}
            >
                <div className="container">
                    <DataTable columns={columns} data={data} />
                </div>
            </PageLayout>
        </div>
    )
}