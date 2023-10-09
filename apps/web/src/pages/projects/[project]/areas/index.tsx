import { PageLayout} from "../../../../components/ui/page-layout"
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import useSWR from "swr"
import React from "react";

export default function ProjectAreas() {
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
                        name: "Gebieden",
                        url: "/projects/1/areas"
                    }
                ]}
                action={
                    <Link href="/projects/1/areas/create">
                        <Button variant="default">
                            <Plus size="20" />
                            Maak een gebied aan
                        </Button>
                    </Link>
                }
            >
                <div className="container">
                </div>
            </PageLayout>
        </div>
    )
}