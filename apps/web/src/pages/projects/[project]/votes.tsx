import { PageLayout} from "../../../components/ui/page-layout"
import useSWR from "swr"
import React from "react";
import { useRouter } from "next/router";
import { ListHeading } from "@/components/ui/typography";

export default function ProjectIdeas() {
    const router = useRouter();
    const { project } = router.query;
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
                        url: `/projects/${project}/votes`
                    }
                ]}
            >
                <div className="container mx-auto py-10">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
                        <ListHeading className="hidden md:flex md:col-span-3">
                        Stem ID
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Stemdatum
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Plan ID
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Gebruiker ID
                        </ListHeading>
                    </div>
                </div>
            </PageLayout>
        </div>
    )
}