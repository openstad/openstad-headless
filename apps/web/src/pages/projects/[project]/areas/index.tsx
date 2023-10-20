import { PageLayout} from "../../../../components/ui/page-layout"
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React from "react";
import { useRouter } from 'next/router';
import { ListHeading } from "@/components/ui/typography";

export default function ProjectAreas() {
    const router = useRouter();
    const projectId = router.query.project;

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
                        url: `/projects/${projectId}/areas`
                    }
                ]}
                action={
                    <Link href={`/projects/${projectId}/areas/create`}>
                        <Button variant="default">
                            <Plus size="20" />
                            Maak een gebied aan
                        </Button>
                    </Link>
                }
            >
                <div className="container mx-auto py-10">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
                        <ListHeading className="hidden md:flex md:col-span-3">
                        ID
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Naam
                        </ListHeading>
                    </div>
                </div>
            </PageLayout>
        </div>
    )
}