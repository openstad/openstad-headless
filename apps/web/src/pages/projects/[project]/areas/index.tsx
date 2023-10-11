import { PageLayout} from "../../../../components/ui/page-layout"
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React from "react";
import { useRouter } from 'next/router';

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
                <div className="container">
                </div>
            </PageLayout>
        </div>
    )
}