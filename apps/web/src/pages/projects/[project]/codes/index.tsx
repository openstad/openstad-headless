import { PageLayout} from "@/components/ui/page-layout"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ListHeading, Paragraph } from "@/components/ui/typography";
import useCodes from "@/hooks/use-codes";
import { CSVLink } from "react-csv";
import { useProject } from "@/hooks/use-project";

const headers = [
    {label: "ID", key: "id"},
    {label: "Code", key: "code"}
]

export default function ProjectCodes() {
    const router = useRouter();
    const { project } = router.query;
    const [projectData, setProjectData] = useState(false);
    let value = 'uniquecode';
    const { data, isLoading } = (projectData ? useCodes(value) : useProject());

    useEffect(() => {
        if (data != undefined) {
            if (!projectData) {
                value = data.config.auth.provider.openstad.clientId;
                setProjectData(true)
            }
        }
    }, [data])

    if(!data?.data) return null;

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
                        url: `/projects/${project}/codes`
                    }
                ]}
                action={
                    <div className="flex">
                        <Link href={`/projects/${project}/codes/create`}>
                            <Button variant="default">
                                <Plus size="20" />
                                Creëer unieke codes
                            </Button>
                        </Link>
                        <Button variant="default" className="ml-6">
                            <CSVLink data={data.data} headers={headers}>
                                Exporteer unieke codes
                            </CSVLink>
                        </Button>
                    </div>
                }
            >
                <div className="container mx-auto py-10">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 py-2 px-2 border-b border-border">
                        <ListHeading className="hidden md:flex md:col-span-3">
                        ID
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Code
                        </ListHeading>
                        <ListHeading className="hidden md:flex md:col-span-2">
                        Al gebruikt
                        </ListHeading>
                    </div>
                    <ul className="container mx-auto">
                        {data?.data.map((code: any) => (
                            <li className="grid grid-cols-2 md:grid-cols-12 items-center py-3 px-2 hover:bg-muted hover:cursor-pointer transition-all duration-200 border-b">
                                <Paragraph className="hidden md:flex md:col-span-2">
                                    {code.id || null}
                                </Paragraph>
                                <Paragraph className="hidden md:flex md:col-span-2">
                                    {code.code || null}
                                </Paragraph>
                                <Paragraph className="hidden md:flex md:col-span-2">
                                    {code.used}
                                </Paragraph>
                            </li>
                        ))}
                    </ul>
                </div>
            </PageLayout>
        </div>
    )
}